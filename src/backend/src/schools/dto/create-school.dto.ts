import { IsString, IsOptional, IsEmail, IsBoolean, IsNumber } from 'class-validator';

export class CreateSchoolDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  geoLat?: number;

  @IsNumber()
  @IsOptional()
  geoLng?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
} 