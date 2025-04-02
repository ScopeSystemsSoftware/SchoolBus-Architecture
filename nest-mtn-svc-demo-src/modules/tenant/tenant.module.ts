import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { Tenant } from './entities/tenant.entity';
import { TenantConnectionService } from './tenant-connection.service';
import { TenantInterceptor } from './interceptors/tenant.interceptor';
import { TenantGuard } from './guards/tenant.guard';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant]),
  ],
  controllers: [TenantController],
  providers: [
    TenantService,
    TenantConnectionService,
    TenantInterceptor,
    TenantGuard,
  ],
  exports: [
    TenantService,
    TenantConnectionService,
    TenantInterceptor,
    TenantGuard,
  ],
})
export class TenantModule {} 