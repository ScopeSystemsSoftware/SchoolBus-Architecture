import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TenantService } from '../tenant.service';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TenantInterceptor.name);

  constructor(private readonly tenantService: TenantService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const tenantId = this.extractTenantId(request);

    if (!tenantId) {
      this.logger.warn('Niciun tenant ID găsit în request');
      return next.handle();
    }

    // Verifică dacă tenant-ul este valid
    const isValid = await this.tenantService.isTenantValid(tenantId);
    if (!isValid) {
      this.logger.warn(`Tenant invalid sau inactiv: ${tenantId}`);
      throw new BadRequestException(`Tenant invalid sau inactiv: ${tenantId}`);
    }

    // Setează tenant-ul în context
    this.tenantService.setCurrentTenant(tenantId);
    
    // Adaugă tenant-ul în header-ul de răspuns pentru debugging
    const response = context.switchToHttp().getResponse();
    response.setHeader('x-tenant-id', tenantId);

    // Procesează request-ul și log-ul la final
    return next.handle().pipe(
      tap(() => {
        this.logger.debug(`Request procesat pentru tenant: ${tenantId}`);
      }),
    );
  }

  /**
   * Extrage tenant ID-ul din diversele locații posibile din request
   * @param request Request HTTP
   * @returns ID-ul tenant-ului sau null
   */
  private extractTenantId(request: any): string | null {
    // 1. Din header dedicat
    const headerTenantId = request.headers['x-tenant-id'];
    if (headerTenantId) {
      return headerTenantId;
    }

    // 2. Din path parameter 
    if (request.params && request.params.tenantId) {
      return request.params.tenantId;
    }

    // 3. Din query parameter
    if (request.query && request.query.tenantId) {
      return request.query.tenantId;
    }

    // 4. Din token JWT (dacă există și conține tenant ID)
    if (request.user && request.user.tenantId) {
      return request.user.tenantId;
    }

    return null;
  }
} 