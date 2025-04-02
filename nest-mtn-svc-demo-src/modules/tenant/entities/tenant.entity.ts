import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { School } from '../../schools/entities/school.entity';
import { Student } from '../../students/entities/student.entity';
import { Bus } from '../../buses/entities/bus.entity';
import { Route } from '../../routes/entities/route.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('tenants')
export class Tenant {
  @ApiProperty({ description: 'ID-ul unic al tenant-ului' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Numele tenant-ului' })
  @Column({ length: 255, nullable: false })
  name: string;

  @ApiProperty({ description: 'Codul unic al tenant-ului utilizat în URL-uri' })
  @Column({ length: 50, nullable: false, unique: true })
  code: string;

  @ApiProperty({ description: 'Email de contact pentru tenant' })
  @Column({ length: 255, nullable: true })
  contactEmail: string;

  @ApiProperty({ description: 'Telefon de contact pentru tenant' })
  @Column({ length: 50, nullable: true })
  contactPhone: string;

  @ApiProperty({ description: 'Schema bazei de date folosită pentru acest tenant (pentru Faza 3)' })
  @Column({ length: 50, nullable: true })
  dbSchema: string;

  @ApiProperty({ description: 'Status-ul tenant-ului (activ/inactiv)' })
  @Column({ default: true })
  active: boolean;

  @ApiProperty({ description: 'Configurări specifice pentru tenant (JSON)' })
  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @ApiProperty({ description: 'Data creării tenant-ului' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Data ultimei actualizări a tenant-ului' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relații 1-la-mulți cu entitățile care aparțin acestui tenant
  @OneToMany(() => School, school => school.tenant)
  schools: School[];

  @OneToMany(() => Student, student => student.tenant)
  students: Student[];

  @OneToMany(() => Bus, bus => bus.tenant)
  buses: Bus[];

  @OneToMany(() => Route, route => route.tenant)
  routes: Route[];

  @OneToMany(() => User, user => user.tenant)
  users: User[];
} 