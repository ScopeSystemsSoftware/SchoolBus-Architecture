import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { SchoolsService } from '../services/schools.service';
import { CreateSchoolDto } from '../dto/create-school.dto';
import { UpdateSchoolDto } from '../dto/update-school.dto';
import { School } from '../entities/school.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantService } from '../../tenant/tenant.service';

@ApiTags('schools')
@ApiSecurity('tenant-id')
@ApiBearerAuth()
@Controller('schools')
@UseGuards(JwtAuthGuard)
export class SchoolsController {
  private readonly logger = new Logger(SchoolsController.name);

  constructor(
    private readonly schoolsService: SchoolsService,
    private readonly tenantService: TenantService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crează o școală nouă' })
  @ApiResponse({ 
    status: 201, 
    description: 'Școala a fost creată cu succes',
    type: School,
  })
  async create(@Body() createSchoolDto: CreateSchoolDto): Promise<School> {
    const tenantId = this.tenantService.getCurrentTenant();
    this.logger.log(`Creare școală pentru tenant: ${tenantId}`);
    return this.schoolsService.create(createSchoolDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obține toate școlile pentru tenant-ul curent' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de școli returnată cu succes',
    type: [School],
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numărul paginii pentru paginare' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Numărul de elemente per pagină' })
  @ApiQuery({ name: 'city', required: false, type: String, description: 'Filtrare după oraș' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Filtrare după tipul școlii' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('city') city?: string,
    @Query('type') type?: string,
  ): Promise<{ data: School[]; total: number; page: number; limit: number }> {
    const tenantId = this.tenantService.getCurrentTenant();
    this.logger.log(`Obținere școli pentru tenant: ${tenantId}`);
    return this.schoolsService.findAll({
      page,
      limit,
      city,
      type,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obține o școală după ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Școala returnată cu succes',
    type: School,
  })
  @ApiResponse({ status: 404, description: 'Școala nu a fost găsită' })
  @ApiParam({ name: 'id', description: 'ID-ul școlii' })
  async findOne(@Param('id') id: string): Promise<School> {
    const tenantId = this.tenantService.getCurrentTenant();
    this.logger.log(`Obținere școală cu ID ${id} pentru tenant: ${tenantId}`);
    return this.schoolsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizează o școală' })
  @ApiResponse({ 
    status: 200, 
    description: 'Școala a fost actualizată cu succes',
    type: School,
  })
  @ApiResponse({ status: 404, description: 'Școala nu a fost găsită' })
  @ApiParam({ name: 'id', description: 'ID-ul școlii' })
  async update(
    @Param('id') id: string,
    @Body() updateSchoolDto: UpdateSchoolDto,
  ): Promise<School> {
    const tenantId = this.tenantService.getCurrentTenant();
    this.logger.log(`Actualizare școală cu ID ${id} pentru tenant: ${tenantId}`);
    return this.schoolsService.update(id, updateSchoolDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Șterge o școală' })
  @ApiResponse({ 
    status: 200, 
    description: 'Școala a fost ștearsă cu succes',
  })
  @ApiResponse({ status: 404, description: 'Școala nu a fost găsită' })
  @ApiParam({ name: 'id', description: 'ID-ul școlii' })
  async remove(@Param('id') id: string): Promise<void> {
    const tenantId = this.tenantService.getCurrentTenant();
    this.logger.log(`Ștergere școală cu ID ${id} pentru tenant: ${tenantId}`);
    return this.schoolsService.remove(id);
  }
} 