import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from './entities/school.entity';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolsService {
  constructor(
    @InjectRepository(School)
    private schoolsRepository: Repository<School>,
  ) {}

  async create(createSchoolDto: CreateSchoolDto): Promise<School> {
    const school = this.schoolsRepository.create(createSchoolDto);
    return await this.schoolsRepository.save(school);
  }

  async findAll(): Promise<School[]> {
    return await this.schoolsRepository.find({ 
      where: { active: true },
      relations: ['students']
    });
  }

  async findOne(id: string): Promise<School> {
    const school = await this.schoolsRepository.findOne({
      where: { id, active: true },
      relations: ['students']
    });
    
    if (!school) {
      throw new NotFoundException(`School with ID ${id} not found`);
    }
    
    return school;
  }

  async update(id: string, updateSchoolDto: UpdateSchoolDto): Promise<School> {
    const school = await this.findOne(id);
    
    Object.assign(school, updateSchoolDto);
    
    return await this.schoolsRepository.save(school);
  }

  async remove(id: string): Promise<void> {
    const school = await this.findOne(id);
    
    // Soft delete - just mark as inactive
    school.active = false;
    await this.schoolsRepository.save(school);
  }
} 