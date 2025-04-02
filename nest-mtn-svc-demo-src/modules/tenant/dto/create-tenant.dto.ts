import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean, Length, Matches, IsObject } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Numele tenant-ului',
    example: 'Primăria Sector 1',
  })
  @IsString()
  @Length(3, 255)
  name: string;

  @ApiProperty({
    description: 'Codul unic al tenant-ului (utilizat în URL-uri, fără spații, doar caractere alfanumerice și -)',
    example: 'primaria-sector1',
  })
  @IsString()
  @Length(3, 50)
  @Matches(/^[a-z0-9-]+$/, { message: 'Codul poate conține doar litere mici, cifre și liniuță (-)' })
  code: string;

  @ApiProperty({
    description: 'Email de contact pentru tenant',
    example: 'contact@primariasector1.ro',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiProperty({
    description: 'Telefon de contact pentru tenant',
    example: '+40212345678',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(5, 50)
  contactPhone?: string;

  @ApiProperty({
    description: 'Schema bazei de date pentru acest tenant (pentru Faza 3)',
    example: 'tenant_primaria_sector1',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(3, 50)
  @Matches(/^[a-z0-9_]+$/, { message: 'Schema poate conține doar litere mici, cifre și underscore (_)' })
  dbSchema?: string;

  @ApiProperty({
    description: 'Status-ul tenant-ului (activ/inactiv)',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({
    description: 'Configurări specifice pentru tenant (JSON)',
    example: { maxUsers: 50, allowedModules: ['schools', 'students', 'buses'] },
    required: false,
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
} 