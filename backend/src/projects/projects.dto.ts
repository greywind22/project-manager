import { IsString, IsOptional, IsDateString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

// DTOs (Data Transfer Objects) define what shape of data the API accepts.
// class-validator decorators enforce this at runtime when validation pipe is enabled.
// If a request body doesn't match, NestJS automatically returns a 400.

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsDateString()
  bookedDate?: string;

  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsOptional()
  @IsString()
  customerRef?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

// PartialType makes all fields optional
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}