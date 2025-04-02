import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TenantService } from './tenant.service';
import { DataSource, DataSourceOptions } from 'typeorm';

/**
 * Serviciu pentru gestionarea conexiunilor la bază de date per tenant
 * În Faza 1-2, se utilizează o singură bază de date cu schema tenant_id
 * În Faza 3, se poate utiliza database per tenant sau schema per tenant
 */
@Injectable()
export class TenantConnectionService implements OnModuleInit {
  private readonly logger = new Logger(TenantConnectionService.name);
  private tenantConnections: Map<string, DataSource> = new Map();
  private defaultConnection: DataSource;

  constructor(
    private readonly configService: ConfigService,
    private readonly tenantService: TenantService,
  ) {}

  async onModuleInit() {
    await this.initializeDefaultConnection();
  }

  /**
   * Inițializează conexiunea de bază pentru aplicație
   */
  private async initializeDefaultConnection() {
    try {
      const options: DataSourceOptions = {
        type: 'postgres',
        host: this.configService.get('DB_HOST', 'localhost'),
        port: +this.configService.get('DB_PORT', 5432),
        username: this.configService.get('DB_USERNAME', 'postgres'),
        password: this.configService.get('DB_PASSWORD', 'postgres'),
        database: this.configService.get('DB_DATABASE', 'schoolbus'),
        synchronize: this.configService.get('DB_SYNCHRONIZE', 'false') === 'true',
        logging: this.configService.get('DB_LOGGING', 'false') === 'true',
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
      };

      this.defaultConnection = new DataSource(options);
      await this.defaultConnection.initialize();
      this.logger.log('Conexiunea default la baza de date a fost inițializată cu succes');
    } catch (error) {
      this.logger.error(`Eroare la inițializarea conexiunii default: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obține conexiunea pentru tenant-ul curent
   * @returns DataSource pentru tenant-ul curent
   */
  async getConnection(): Promise<DataSource> {
    const tenantId = this.tenantService.getCurrentTenant();
    
    // Dacă nu există tenant în context, sau suntem în Faza 1-2, 
    // returnăm conexiunea default
    if (!tenantId || !this.configService.get('MULTI_TENANT_SEPARATE_DB', false)) {
      return this.defaultConnection;
    }

    // Verifică dacă există deja o conexiune pentru acest tenant
    if (this.tenantConnections.has(tenantId)) {
      return this.tenantConnections.get(tenantId);
    }

    // Creează o nouă conexiune pentru tenant
    return this.createConnectionForTenant(tenantId);
  }

  /**
   * Crează o conexiune la baza de date specifică pentru un tenant
   * Utilizat în Faza 3 pentru izolare completă a datelor
   * @param tenantId ID-ul tenant-ului
   * @returns DataSource pentru tenant
   */
  private async createConnectionForTenant(tenantId: string): Promise<DataSource> {
    try {
      // Obținem informații despre tenant
      const tenant = await this.tenantService.findById(tenantId);
      
      if (!tenant) {
        this.logger.warn(`Tenant negăsit pentru ID: ${tenantId}`);
        return this.defaultConnection;
      }

      // Opțiuni pentru conexiune - pot fi customizate per tenant
      const options: DataSourceOptions = {
        type: 'postgres',
        host: this.configService.get('DB_HOST', 'localhost'),
        port: +this.configService.get('DB_PORT', 5432),
        username: this.configService.get('DB_USERNAME', 'postgres'),
        password: this.configService.get('DB_PASSWORD', 'postgres'),
        database: tenant.dbSchema || this.configService.get('DB_DATABASE', 'schoolbus'),
        schema: tenant.dbSchema || 'public',
        synchronize: this.configService.get('DB_SYNCHRONIZE', 'false') === 'true',
        logging: this.configService.get('DB_LOGGING', 'false') === 'true',
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
      };

      // Creează și inițializează conexiunea
      const connection = new DataSource(options);
      await connection.initialize();
      
      // Salvează conexiunea în cache
      this.tenantConnections.set(tenantId, connection);
      
      this.logger.log(`Conexiune creată pentru tenant: ${tenantId}`);
      return connection;
    } catch (error) {
      this.logger.error(`Eroare la crearea conexiunii pentru tenant ${tenantId}: ${error.message}`);
      return this.defaultConnection;
    }
  }

  /**
   * Închide toate conexiunile active la shutdown
   */
  async onModuleDestroy() {
    try {
      if (this.defaultConnection?.isInitialized) {
        await this.defaultConnection.destroy();
      }

      for (const [tenantId, connection] of this.tenantConnections.entries()) {
        if (connection.isInitialized) {
          await connection.destroy();
          this.logger.log(`Conexiune închisă pentru tenant: ${tenantId}`);
        }
      }
      
      this.logger.log('Toate conexiunile la baza de date au fost închise');
    } catch (error) {
      this.logger.error(`Eroare la închiderea conexiunilor: ${error.message}`);
    }
  }
} 