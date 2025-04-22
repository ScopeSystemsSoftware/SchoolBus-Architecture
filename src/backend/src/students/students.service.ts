import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { SchoolsService } from '../schools/schools.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    private schoolsService: SchoolsService,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const { schoolId, ...studentData } = createStudentDto;
    
    // Check if school exists
    const school = await this.schoolsService.findOne(schoolId);
    
    const student = this.studentsRepository.create({
      ...studentData,
      school,
    });
    
    return await this.studentsRepository.save(student);
  }

  async findAll(): Promise<Student[]> {
    return await this.studentsRepository.find({
      where: { active: true },
      relations: ['school'],
    });
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: { id, active: true },
      relations: ['school'],
    });
    
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    
    return student;
  }

  async findBySchool(schoolId: string): Promise<Student[]> {
    // Check if school exists
    await this.schoolsService.findOne(schoolId);
    
    return await this.studentsRepository.find({
      where: {
        school: { id: schoolId },
        active: true,
      },
      relations: ['school'],
    });
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);
    
    // If schoolId is provided, update the school relation
    if (updateStudentDto.schoolId) {
      const school = await this.schoolsService.findOne(updateStudentDto.schoolId);
      student.school = school;
      
      // Remove schoolId from the DTO to prevent TypeORM errors
      const { schoolId, ...studentData } = updateStudentDto;
      Object.assign(student, studentData);
    } else {
      Object.assign(student, updateStudentDto);
    }
    
    return await this.studentsRepository.save(student);
  }

  async remove(id: string): Promise<void> {
    const student = await this.findOne(id);
    
    // Soft delete - just mark as inactive
    student.active = false;
    await this.studentsRepository.save(student);
  }
} 