import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';

// @Controller('projects') sets the base route for all methods in this class.
// All routes here will be prefixed with /projects.
@Controller('projects')
export class ProjectsController {
  // NestJS injects ProjectsService here automatically.
  constructor(private readonly projectsService: ProjectsService) {}

  // GET /projects
  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  // GET /projects/:id
  // @Param('id') extracts the :id segment from the URL
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  // POST /projects
  // @Body() extracts and validates the request body against CreateProjectDto
  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  // PATCH /projects/:id
  // PATCH (not PUT) because we only update the fields that are sent
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  // DELETE /projects/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}