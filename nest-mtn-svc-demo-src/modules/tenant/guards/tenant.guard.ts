import { Injectable, CanActivate, ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantService } from '../tenant.service';
import { SKIP_TENANT_CHECK_KEY } from '../decorators/skip-tenant-check.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly tenantService: TenantService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verifică dacă ruta are decorator pentru a sări peste verificarea tenant
    const skipCheck = this.reflector.getAllAndOverride<boolean>(
      SKIP_TENANT_CHECK_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipCheck) {
      return true;
    }

    // Obține tenant ID din request (va fi setat de TenantInterceptor)
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'];

    if (!tenantId) {
      this.logger.warn('Acces refuzat: Lipsește tenant ID');
      throw new UnauthorizedException('Acces refuzat: Lipsește tenant ID');
    }

    // Verifică dacă tenant-ul este valid
    const isValid = await this.tenantService.isTenantValid(tenantId);
    if (!isValid) {
      this.logger.warn(`Acces refuzat: Tenant invalid sau inactiv: ${tenantId}`);
      throw new UnauthorizedException(`Acces refuzat: Tenant invalid sau inactiv: ${tenantId}`);
    }

    // Verifică dacă utilizatorul are acces la acest tenant
    if (request.user) {
      const userTenantId = request.user.tenantId;
      
      // Utilizator aparține unui tenant specific
      if (userTenantId && userTenantId !== 'admin' && userTenantId !== tenantId) {
        this.logger.warn(`Acces refuzat: Utilizatorul aparține tenant-ului ${userTenantId}, 
                          dar încearcă să acceseze date pentru tenant-ul ${tenantId}`);
        throw new UnauthorizedException('Acces refuzat: Nu aveți acces la acest tenant');
      }
    }

    return true;
  }
} 