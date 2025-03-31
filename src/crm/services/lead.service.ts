import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeadDto, UpdateLeadDto, ConvertLeadDto } from '../dtos/lead.dto';
import { LeadFiltersDto } from '../dtos/lead-filters.dto';
import { CRMStatusType } from '@prisma/client';

@Injectable()
export class LeadService {
  constructor(private prisma: PrismaService) {}

  async create(createLeadDto: CreateLeadDto) {
    // If no status is provided, get the default LEAD status
    if (!createLeadDto.statusId) {
      const defaultStatus = await this.prisma.cRMStatus.findFirst({
        where: {
          type: CRMStatusType.LEAD,
          isDefault: true,
        },
      });

      if (defaultStatus) {
        createLeadDto.statusId = defaultStatus.id;
      }
    }

    const { statusId, organizationId, personId, tagIds, ...rest } =
      createLeadDto;

    return this.prisma.cRMLead.create({
      data: {
        ...rest,
        status: statusId ? { connect: { id: statusId } } : undefined,
        organization: organizationId
          ? { connect: { id: organizationId } }
          : undefined,
        person: personId ? { connect: { id: personId } } : undefined,
        tags: tagIds ? { connect: tagIds.map((id) => ({ id })) } : undefined,
      },
      include: {
        status: true,
        organization: true,
        person: true,
        tags: true,
      },
    });
  }

  async findAll(filters: LeadFiltersDto) {
    const {
      search,
      statusId,
      organizationId,
      personId,
      createdFrom,
      createdTo,
      minValue,
      maxValue,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Build where conditions
    const where: any = {};

    // Search in title with case insensitivity
    if (search) {
      where.OR = [{ title: { contains: search, mode: 'insensitive' } }];

      // Only add nested queries if there are potentially related entities
      // This avoids "A value is required for..." errors when the field is null
      // Check for organizations with the search term
      const organizations = await this.prisma.cRMOrganization.findMany({
        where: {
          name: { contains: search, mode: 'insensitive' },
        },
        select: { id: true },
      });

      if (organizations.length > 0) {
        where.OR.push({
          organizationId: { in: organizations.map((org) => org.id) },
        });
      }

      // Check for persons with the search term
      const persons = await this.prisma.cRMPerson.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
        select: { id: true },
      });

      if (persons.length > 0) {
        where.OR.push({
          personId: { in: persons.map((person) => person.id) },
        });
      }
    }

    // Filter by relations
    if (statusId) where.statusId = statusId;
    if (organizationId) where.organizationId = organizationId;
    if (personId) where.personId = personId;

    // Date range filter
    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) where.createdAt.gte = new Date(createdFrom);
      if (createdTo) where.createdAt.lte = new Date(createdTo);
    }

    // Value range filter
    if (minValue || maxValue) {
      where.value = {};
      if (minValue) where.value.gte = minValue;
      if (maxValue) where.value.lte = maxValue;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await this.prisma.cRMLead.count({ where });

    // Execute query with filters, pagination and sorting
    const leads = await this.prisma.cRMLead.findMany({
      where,
      include: {
        status: true,
        organization: true,
        person: true,
        tags: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    // Return paginated result
    return {
      data: leads,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const lead = await this.prisma.cRMLead.findUnique({
      where: { id },
      include: {
        status: true,
        organization: true,
        person: true,
        tags: true,
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID "${id}" not found`);
    }

    return lead;
  }

  async update(id: number, updateLeadDto: UpdateLeadDto) {
    // Check if lead exists
    await this.findOne(id);

    const { statusId, organizationId, personId, tagIds, ...rest } =
      updateLeadDto;

    return this.prisma.cRMLead.update({
      where: { id },
      data: {
        ...rest,
        status: statusId ? { connect: { id: statusId } } : undefined,
        organization: organizationId
          ? { connect: { id: organizationId } }
          : undefined,
        person: personId ? { connect: { id: personId } } : undefined,
        tags: tagIds ? { set: tagIds.map((id) => ({ id })) } : undefined,
      },
      include: {
        status: true,
        organization: true,
        person: true,
        tags: true,
      },
    });
  }

  async remove(id: number) {
    // Check if lead exists
    await this.findOne(id);

    return this.prisma.cRMLead.delete({
      where: { id },
    });
  }

  async convert(id: number, convertLeadDto: ConvertLeadDto) {
    const lead = await this.findOne(id);

    // If no pipeline is specified, get the default pipeline
    if (!convertLeadDto.pipelineId) {
      const defaultPipeline = await this.prisma.cRMPipeline.findFirst({
        where: { isDefault: true },
        include: { stages: { orderBy: { displayOrder: 'asc' }, take: 1 } },
      });

      if (!defaultPipeline) {
        throw new BadRequestException('No default pipeline found');
      }

      convertLeadDto.pipelineId = defaultPipeline.id;

      // If no stage is specified, use the first stage of the default pipeline
      if (!convertLeadDto.stageId && defaultPipeline.stages.length > 0) {
        convertLeadDto.stageId = defaultPipeline.stages[0].id;
      }
    }

    // Get default DEAL status
    const defaultDealStatus = await this.prisma.cRMStatus.findFirst({
      where: {
        type: CRMStatusType.DEAL,
        isDefault: true,
      },
    });

    // Create the deal
    const deal = await this.prisma.cRMDeal.create({
      data: {
        title: lead.title,
        value: lead.value,
        probability: convertLeadDto.probability || 0,
        expectedCloseDate: convertLeadDto.expectedCloseDate
          ? new Date(convertLeadDto.expectedCloseDate)
          : null,
        pipeline: { connect: { id: convertLeadDto.pipelineId } },
        stage: convertLeadDto.stageId
          ? { connect: { id: convertLeadDto.stageId } }
          : undefined,
        status: defaultDealStatus
          ? { connect: { id: defaultDealStatus.id } }
          : undefined,
        organization: lead.organizationId
          ? { connect: { id: lead.organizationId } }
          : undefined,
        person: lead.personId ? { connect: { id: lead.personId } } : undefined,
      },
    });

    // Delete the lead
    await this.remove(id);

    return deal;
  }
}
