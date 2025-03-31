import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateStatusDto,
  UpdateStatusDto,
  StatusFiltersDto,
} from '../dtos/status.dto';
import { CRMStatusType } from '@prisma/client';

@Injectable()
export class StatusService {
  constructor(private prisma: PrismaService) {}

  async create(createStatusDto: CreateStatusDto) {
    // If this is set as default, unset any existing default for this type
    if (createStatusDto.isDefault) {
      await this.prisma.cRMStatus.updateMany({
        where: {
          type: createStatusDto.type,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    try {
      return await this.prisma.cRMStatus.create({
        data: createStatusDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `Status with name "${createStatusDto.name}" already exists for type "${createStatusDto.type}"`,
        );
      }
      throw error;
    }
  }

  async findAll(filters: StatusFiltersDto) {
    const {
      search,
      type,
      isDefault,
      page = 1,
      limit = 10,
      sortBy = 'displayOrder',
      sortOrder = 'asc',
    } = filters;

    // Build where conditions
    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (type) {
      where.type = type;
    }

    if (typeof isDefault === 'boolean') {
      where.isDefault = isDefault;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await this.prisma.cRMStatus.count({ where });

    // Execute query with filters, pagination and sorting
    const statuses = await this.prisma.cRMStatus.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    return {
      data: statuses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByType(type: CRMStatusType) {
    return this.prisma.cRMStatus.findMany({
      where: { type },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(id: number) {
    const status = await this.prisma.cRMStatus.findUnique({
      where: { id },
    });

    if (!status) {
      throw new NotFoundException(`Status with ID "${id}" not found`);
    }

    return status;
  }

  async update(id: number, updateStatusDto: UpdateStatusDto) {
    const status = await this.findOne(id);

    // If this is set as default, unset any existing default for this type
    if (updateStatusDto.isDefault) {
      await this.prisma.cRMStatus.updateMany({
        where: {
          type: status.type,
          isDefault: true,
          id: { not: id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    try {
      return await this.prisma.cRMStatus.update({
        where: { id },
        data: updateStatusDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `Status with name "${updateStatusDto.name}" already exists for type "${status.type}"`,
        );
      }
      throw error;
    }
  }

  async remove(id: number) {
    const status = await this.findOne(id);

    if (status.isDefault) {
      throw new ConflictException('Cannot delete a default status');
    }

    // Check if status is being used
    const usageCount = await this.getStatusUsageCount(id);
    if (usageCount > 0) {
      throw new ConflictException(
        'Cannot delete status that is being used by entities',
      );
    }

    return this.prisma.cRMStatus.delete({
      where: { id },
    });
  }

  private async getStatusUsageCount(statusId: number) {
    const status = await this.prisma.cRMStatus.findUnique({
      where: { id: statusId },
      include: {
        _count: {
          select: {
            leads: true,
            deals: true,
            projects: true,
            activities: true,
          },
        },
      },
    });

    if (!status) return 0;

    return (
      status._count.leads +
      status._count.deals +
      status._count.projects +
      status._count.activities
    );
  }
}
