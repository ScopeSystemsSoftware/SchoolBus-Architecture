import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { School } from '../../schools/entities/school.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => School, (school) => school.students)
  school: School;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  grade: string;

  @Column({ nullable: true })
  guardianName: string;

  @Column({ nullable: true })
  guardianPhone: string;

  @Column({ nullable: true })
  guardianEmail: string;

  @Column({ nullable: true })
  address: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 