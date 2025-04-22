import { IsString, IsOptional, IsEmail, IsBoolean, IsUUID } from 'class-validator';

export class CreateStudentDto {
  @IsUUID()
  schoolId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsString()
  @IsOptional()
  guardianName?: string;

  @IsString()
  @IsOptional()
  guardianPhone?: string;

  @IsEmail()
  @IsOptional()
  guardianEmail?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
} 