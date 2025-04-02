import { SetMetadata } from '@nestjs/common';

export const SKIP_TENANT_CHECK_KEY = 'skipTenantCheck';

/**
 * Decorator pentru a marca rutele care nu necesită verificare tenant
 * Utilizat pentru rute publice sau pentru rute de management tenant
 * @example
 * @SkipTenantCheck()
 * @Get('/health')
 * checkHealth() { ... }
 */
export const SkipTenantCheck = () => SetMetadata(SKIP_TENANT_CHECK_KEY, true); 