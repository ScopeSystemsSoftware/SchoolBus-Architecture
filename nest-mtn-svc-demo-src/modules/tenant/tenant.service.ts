import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsyncLocalStorage } from 'async_hooks';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);
  private readonly tenantStorage = new AsyncLocalStorage<string>();

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * Setează tenant-ul curent în contextul AsyncLocalStorage
   * @param tenantId ID-ul tenant-ului
   */
  setCurrentTenant(tenantId: string): void {
    this.tenantStorage.enterWith(tenantId);
    this.logger.debug(`Tenant setat în context: ${tenantId}`);
  }

  /**
   * Obține ID-ul tenant-ului curent din context
   * @returns ID-ul tenant-ului sau null dacă nu există
   */
  getCurrentTenant(): string | null {
    const tenantId = this.tenantStorage.getStore();
    return tenantId ?? null;
  }

  /**
   * Verifică dacă tenant-ul există și este activ
   * @param tenantId ID-ul tenant-ului
   * @returns True dacă tenant-ul este valid și activ
   */
  async isTenantValid(tenantId: string): Promise<boolean> {
    try {
      const tenant = await this.tenantRepository.findOne({
        where: { id: tenantId, active: true },
      });
      return !!tenant;
    } catch (error) {
      this.logger.error(`Eroare la verificarea tenant-ului ${tenantId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Obține tenant-ul după ID
   * @param id ID-ul tenant-ului
   * @returns Obiectul tenant
   */
  async findById(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant-ul cu ID ${id} nu a fost găsit`);
    }

    return tenant;
  }

  /**
   * Obține tenant-ul după cod
   * @param code Codul unic al tenant-ului
   * @returns Obiectul tenant
   */
  async findByCode(code: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { code },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant-ul cu codul ${code} nu a fost găsit`);
    }

    return tenant;
  }

  /**
   * Crează un tenant nou
   * @param createTenantDto Date pentru crearea tenant-ului
   * @returns Tenant-ul nou creat
   */
  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const tenant = this.tenantRepository.create(createTenantDto);
    return this.tenantRepository.save(tenant);
  }

  /**
   * Actualizează un tenant existent
   * @param id ID-ul tenant-ului
   * @param updateTenantDto Date pentru actualizare
   * @returns Tenant-ul actualizat
   */
  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findById(id);
    this.tenantRepository.merge(tenant, updateTenantDto);
    return this.tenantRepository.save(tenant);
  }

  /**
   * Obține toți tenanții
   * @returns Lista cu toți tenanții
   */
  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find();
  }

  /**
   * Șterge un tenant
   * @param id ID-ul tenant-ului
   * @returns Rezultatul operației
   */
  async remove(id: string): Promise<void> {
    const tenant = await this.findById(id);
    await this.tenantRepository.remove(tenant);
  }
} 