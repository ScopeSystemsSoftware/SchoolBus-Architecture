import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { Student } from '../../students/entities/student.entity';
import { Route } from '../../routes/entities/route.entity';

@Entity('schools')
export class School {
  @ApiProperty({ description: 'ID-ul unic al școlii' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID-ul tenant-ului de care aparține școala' })
  @Column({ name: 'tenant_id' })
  @Index()
  tenantId: string;

  @ApiProperty({ description: 'Numele școlii' })
  @Column({ length: 255, nullable: false })
  name: string;

  @ApiProperty({ description: 'Adresa școlii - stradă' })
  @Column({ length: 255, nullable: true })
  street: string;

  @ApiProperty({ description: 'Adresa școlii - oraș' })
  @Column({ length: 100, nullable: true })
  @Index()
  city: string;

  @ApiProperty({ description: 'Adresa școlii - județ/stat' })
  @Column({ length: 100, nullable: true })
  state: string;

  @ApiProperty({ description: 'Adresa școlii - cod poștal' })
  @Column({ length: 20, nullable: true })
  postalCode: string;

  @ApiProperty({ description: 'Adresa școlii - țară' })
  @Column({ length: 100, nullable: true })
  country: string;

  @ApiProperty({ description: 'Număr telefon al școlii' })
  @Column({ length: 50, nullable: true })
  phone: string;

  @ApiProperty({ description: 'Email al școlii' })
  @Column({ length: 255, nullable: true })
  email: string;

  @ApiProperty({ description: 'Numele directorului școlii' })
  @Column({ length: 255, nullable: true })
  principal: string;

  @ApiProperty({ description: 'Tipul școlii (PRIMARY, MIDDLE, HIGH, COLLEGE)' })
  @Column({ 
    type: 'enum', 
    enum: ['PRIMARY', 'MIDDLE', 'HIGH', 'COLLEGE'], 
    default: 'PRIMARY' 
  })
  @Index()
  type: string;

  @ApiProperty({ description: 'Coordonate geografice - latitudine' })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  geoLat: number;

  @ApiProperty({ description: 'Coordonate geografice - longitudine' })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  geoLng: number;

  @ApiProperty({ description: 'Status-ul școlii (activă/inactivă)' })
  @Column({ default: true })
  active: boolean;

  @ApiProperty({ description: 'Data creării înregistrării' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Data ultimei actualizări' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relații
  @ManyToOne(() => Tenant, tenant => tenant.schools)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => Student, student => student.school)
  students: Student[];

  @OneToMany(() => Route, route => route.school)
  routes: Route[];
} 