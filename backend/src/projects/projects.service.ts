import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      // Include counts rather than full relations for the list view —
      // we don't need full asset data just to render a project card.
      include: {
        _count: { select: { assets: true } },
      },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        // Fetch all assets with their type-specific sub-tables
        assets: {
          include: {
            assetLink: true,
            assetFile: true,
            assetVideo: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        customFields: {
          orderBy: { key: 'asc' },
        },
      },
    });

    if (!project) {
      // NestJS will catch this and return a 404 response automatically
      throw new NotFoundException(`Project ${id} not found`);
    }

    return project;
  }

  async create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        ...dto,
        bookedDate: dto.bookedDate ? new Date(dto.bookedDate) : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id); // throws 404 if not found
    return this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        bookedDate: dto.bookedDate ? new Date(dto.bookedDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // throws 404 if not found
    // onDelete: Cascade in the schema means all related assets and
    // custom fields are deleted automatically by the DB.
    return this.prisma.project.delete({ where: { id } });
  }
}