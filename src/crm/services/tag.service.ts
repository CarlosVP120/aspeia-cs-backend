import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateTagDto,
  UpdateTagDto,
  AssignTagsDto,
  TagFiltersDto,
} from '../dtos/tag.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  async create(createTagDto: CreateTagDto) {
    return this.prisma.cRMTag.create({
      data: createTagDto,
    });
  }

  async findAll(filters: TagFiltersDto) {
    const { search, sortBy = 'name', sortOrder = 'asc' } = filters;

    // Build where conditions
    const where: Prisma.CRMTagWhereInput = {};

    // Search in name with case insensitivity
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    // Execute query with filters and sorting
    const tags = await this.prisma.cRMTag.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        _count: {
          select: {
            organizations: true,
            persons: true,
            leads: true,
          },
        },
      },
    });

    // Return all tags
    return tags;
  }

  async findOne(id: number) {
    const tag = await this.prisma.cRMTag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            organizations: true,
            persons: true,
            leads: true,
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }

    return tag;
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    // Check if tag exists
    await this.findOne(id);

    return this.prisma.cRMTag.update({
      where: { id },
      data: updateTagDto,
      include: {
        _count: {
          select: {
            organizations: true,
            persons: true,
            leads: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    // Check if tag exists
    await this.findOne(id);

    return this.prisma.cRMTag.delete({
      where: { id },
    });
  }

  async assignTags(assignTagsDto: AssignTagsDto) {
    const { tagIds, entityType, entityId } = assignTagsDto;

    // Verify all tags exist
    const existingTags = await this.prisma.cRMTag.findMany({
      where: { id: { in: tagIds } },
    });

    if (existingTags.length !== tagIds.length) {
      throw new BadRequestException('One or more tags do not exist');
    }

    // Check if entity exists and get current tags
    const entity = await this.findEntityWithTags(entityType, entityId);

    if (!entity) {
      throw new NotFoundException(
        `${entityType} with ID "${entityId}" not found`,
      );
    }

    // Update entity with new tags
    return this.updateEntityTags(entityType, entityId, {
      connect: tagIds.map((id) => ({ id })),
    });
  }

  async unassignTags(assignTagsDto: AssignTagsDto) {
    const { tagIds, entityType, entityId } = assignTagsDto;

    // Check if entity exists and get current tags
    const entity = await this.findEntityWithTags(entityType, entityId);

    if (!entity) {
      throw new NotFoundException(
        `${entityType} with ID "${entityId}" not found`,
      );
    }

    // Update entity by disconnecting tags
    return this.updateEntityTags(entityType, entityId, {
      disconnect: tagIds.map((id) => ({ id })),
    });
  }

  private async findEntityWithTags(entityType: string, entityId: number) {
    switch (entityType) {
      case 'lead':
        return this.prisma.cRMLead.findUnique({
          where: { id: entityId },
          include: { tags: true },
        });
      case 'person':
        return this.prisma.cRMPerson.findUnique({
          where: { id: entityId },
          include: { tags: true },
        });
      case 'organization':
        return this.prisma.cRMOrganization.findUnique({
          where: { id: entityId },
          include: { tags: true },
        });
      default:
        throw new BadRequestException('Invalid entity type');
    }
  }

  private async updateEntityTags(
    entityType: string,
    entityId: number,
    tagsOperation:
      | Prisma.CRMTagUpdateManyWithoutOrganizationsNestedInput
      | Prisma.CRMTagUpdateManyWithoutPersonsNestedInput
      | Prisma.CRMTagUpdateManyWithoutLeadsNestedInput,
  ) {
    switch (entityType) {
      case 'lead':
        return this.prisma.cRMLead.update({
          where: { id: entityId },
          data: { tags: tagsOperation },
          include: { tags: true },
        });
      case 'person':
        return this.prisma.cRMPerson.update({
          where: { id: entityId },
          data: { tags: tagsOperation },
          include: { tags: true },
        });
      case 'organization':
        return this.prisma.cRMOrganization.update({
          where: { id: entityId },
          data: { tags: tagsOperation },
          include: { tags: true },
        });
      default:
        throw new BadRequestException('Invalid entity type');
    }
  }
}
