import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeadDto, UpdateLeadDto, ConvertLeadDto } from '../dtos/lead.dto';
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

    const { statusId, organizationId, personId, ...rest } = createLeadDto;

    return this.prisma.cRMLead.create({
      data: {
        ...rest,
        status: statusId ? { connect: { id: statusId } } : undefined,
        organization: organizationId
          ? { connect: { id: organizationId } }
          : undefined,
        person: personId ? { connect: { id: personId } } : undefined,
      },
      include: {
        status: true,
        organization: true,
        person: true,
      },
    });
  }

  async findAll() {
    return this.prisma.cRMLead.findMany({
      include: {
        status: true,
        organization: true,
        person: true,
      },
    });
  }

  async findOne(id: number) {
    const lead = await this.prisma.cRMLead.findUnique({
      where: { id },
      include: {
        status: true,
        organization: true,
        person: true,
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

    const { statusId, organizationId, personId, ...rest } = updateLeadDto;

    return this.prisma.cRMLead.update({
      where: { id },
      data: {
        ...rest,
        status: statusId ? { connect: { id: statusId } } : undefined,
        organization: organizationId
          ? { connect: { id: organizationId } }
          : undefined,
        person: personId ? { connect: { id: personId } } : undefined,
      },
      include: {
        status: true,
        organization: true,
        person: true,
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
