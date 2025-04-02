import { PartialType } from '@nestjs/swagger';
import { CreateTenantDto } from './create-tenant.dto';

/**
 * DTO pentru actualizarea datelor unui tenant
 * Extinde CreateTenantDto, dar face toate câmpurile opționale
 */
export class UpdateTenantDto extends PartialType(CreateTenantDto) {} 