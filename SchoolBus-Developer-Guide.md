# Ghid de Dezvoltare SchoolBus - School Management Service

## Cuprins
1. [Introducere](#1-introducere)
2. [Setup Proiect](#2-setup-proiect)
3. [Implementare School Management Service](#3-implementare-school-management-service)
4. [Implementare Frontend Next.js](#4-implementare-frontend-nextjs)
5. [Testing și Rulare](#5-testing-și-rulare)

## 1. Introducere

Acest ghid este destinat dezvoltatorilor care încep să lucreze la proiectul SchoolBus. Vom începe cu implementarea School Management Service, care este un punct de pornire ideal pentru a învăța arhitectura și tehnologiile folosite în proiect.

### Tehnologii Utilizate
- NestJS pentru backend
- Next.js pentru frontend
- TypeORM pentru baza de date
- PostgreSQL ca bază de date
- Swagger pentru documentație API

## 2. Setup Proiect

### Instalare Dependențe Globale
```bash
# Instalare NestJS CLI
npm i -g @nestjs/cli

# Creare proiect nou
nest new school-management
cd school-management

# Instalare dependențe necesare
npm install @nestjs/swagger swagger-ui-express
npm install @nestjs/typeorm typeorm pg
npm install class-validator class-transformer
```

### Configurare Inițială

#### main.ts
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Prefix global pentru toate rutele
  app.setGlobalPrefix('api');
  
  // Validare automată
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Configurare Swagger
  const config = new DocumentBuilder()
    .setTitle('SchoolBus API')
    .setDescription('API pentru managementul școlilor')
    .setVersion('1.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // CORS
  app.enableCors();

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
```

#### app.module.ts
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SchoolsModule } from './schools/schools.module';
import { School } from './schools/entities/school.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: +configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [School],
        synchronize: true, // Doar pentru development!
      }),
      inject: [ConfigService],
    }),
    SchoolsModule,
  ],
})
export class AppModule {}
```

### Structura de Fișiere Completă
```
school-management/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   └── schools/
│       ├── dto/
│       │   ├── create-school.dto.ts
│       │   └── update-school.dto.ts
│       ├── entities/
│       │   └── school.entity.ts
│       ├── schools.controller.ts
│       ├── schools.service.ts
│       └── schools.module.ts
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

## 3. Implementare School Management Service

### 3.1 Entity (school.entity.ts)

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('schools')
export class School {
  @ApiProperty({ description: 'ID-ul unic al școlii' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Numele școlii' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Adresa școlii' })
  @Column({ length: 255 })
  address: string;

  @ApiProperty({ description: 'Orașul școlii' })
  @Column({ length: 100 })
  city: string;

  @ApiProperty({ description: 'Numărul de telefon' })
  @Column({ length: 20, nullable: true })
  phone: string;

  @ApiProperty({ description: 'Email-ul școlii' })
  @Column({ length: 255, nullable: true })
  email: string;

  @ApiProperty({ description: 'Status-ul școlii' })
  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 3.2 DTO-uri

```typescript
// create-school.dto.ts
import { IsString, IsEmail, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSchoolDto {
  @ApiProperty({ example: 'Școala Gimnazială Nr. 1' })
  @IsString()
  @Length(3, 255)
  name: string;

  @ApiProperty({ example: 'Strada Exemplu nr. 1' })
  @IsString()
  @Length(5, 255)
  address: string;

  @ApiProperty({ example: 'București' })
  @IsString()
  @Length(2, 100)
  city: string;

  @ApiProperty({ example: '0212345678', required: false })
  @IsOptional()
  @IsString()
  @Length(10, 20)
  phone?: string;

  @ApiProperty({ example: 'contact@scoala1.ro', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;
}

// update-school.dto.ts
import { PartialType } from '@nestjs/swagger';
export class UpdateSchoolDto extends PartialType(CreateSchoolDto) {}
```

### 3.3 Controller (schools.controller.ts)

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { School } from './entities/school.entity';

@ApiTags('schools')
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Post()
  @ApiOperation({ summary: 'Creează o școală nouă' })
  @ApiResponse({ status: 201, description: 'Școala a fost creată', type: School })
  create(@Body() createSchoolDto: CreateSchoolDto): Promise<School> {
    return this.schoolsService.create(createSchoolDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obține lista școlilor' })
  @ApiResponse({ status: 200, description: 'Lista școlilor', type: [School] })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{ data: School[]; total: number; page: number; limit: number }> {
    return this.schoolsService.findAll({ page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obține o școală după ID' })
  @ApiResponse({ status: 200, description: 'Școala găsită', type: School })
  findOne(@Param('id') id: string): Promise<School> {
    return this.schoolsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizează o școală' })
  @ApiResponse({ status: 200, description: 'Școala actualizată', type: School })
  update(
    @Param('id') id: string,
    @Body() updateSchoolDto: UpdateSchoolDto,
  ): Promise<School> {
    return this.schoolsService.update(id, updateSchoolDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Șterge o școală' })
  @ApiResponse({ status: 200, description: 'Școala ștearsă' })
  remove(@Param('id') id: string): Promise<void> {
    return this.schoolsService.remove(id);
  }
}
```

### 3.4 Service (schools.service.ts)

```typescript
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

  async findAll({ page, limit }: { page: number; limit: number }) {
    const [data, total] = await this.schoolsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<School> {
    const school = await this.schoolsRepository.findOne({ where: { id } });
    if (!school) {
      throw new NotFoundException(`Școala cu ID ${id} nu a fost găsită`);
    }
    return school;
  }

  async update(id: string, updateSchoolDto: UpdateSchoolDto): Promise<School> {
    const school = await this.findOne(id);
    Object.assign(school, updateSchoolDto);
    return await this.schoolsRepository.save(school);
  }

  async remove(id: string): Promise<void> {
    const result = await this.schoolsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Școala cu ID ${id} nu a fost găsită`);
    }
  }
}
```

### 3.5 Module (schools.module.ts)

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolsController } from './schools.controller';
import { SchoolsService } from './schools.service';
import { School } from './entities/school.entity';

@Module({
  imports: [TypeOrmModule.forFeature([School])],
  controllers: [SchoolsController],
  providers: [SchoolsService],
  exports: [SchoolsService],
})
export class SchoolsModule {}
```

## 4. Implementare Frontend Next.js

### 4.1 API Client (app/api/schools.ts)

```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const schoolsApi = {
  getAll: async (page = 1, limit = 10) => {
    const response = await axios.get(`${API_URL}/schools?page=${page}&limit=${limit}`);
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await axios.get(`${API_URL}/schools/${id}`);
    return response.data;
  },

  create: async (data: CreateSchoolDto) => {
    const response = await axios.post(`${API_URL}/schools`, data);
    return response.data;
  },

  update: async (id: string, data: UpdateSchoolDto) => {
    const response = await axios.put(`${API_URL}/schools/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await axios.delete(`${API_URL}/schools/${id}`);
  },
};
```

### 4.2 Pagina de Listare Școli (app/schools/page.tsx)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { schoolsApi } from '../api/schools';

export default function SchoolsPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const response = await schoolsApi.getAll();
        setSchools(response.data);
      } catch (error) {
        console.error('Error loading schools:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSchools();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Școli</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schools.map((school) => (
          <div key={school.id} className="border p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold">{school.name}</h2>
            <p>{school.address}</p>
            <p>{school.city}</p>
            {school.phone && <p>Tel: {school.phone}</p>}
            {school.email && <p>Email: {school.email}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 5. Testing și Rulare

### 5.1 Configurare .env

```env
# Backend (.env)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=schoolbus
PORT=3000

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 5.2 Configurare package.json

Asigură-te că ai următoarele script-uri în package.json:

```json
{
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix"
  }
}
```

### 5.3 Pași pentru Rulare

1. Asigură-te că ai PostgreSQL instalat și rulând
2. Creează baza de date:
```sql
CREATE DATABASE schoolbus;
```

3. Configurează fișierul .env cu credențialele corecte

4. Instalează dependențele:
```bash
npm install
```

5. Pornește aplicația în modul development:
```bash
npm run start:dev
```

6. Verifică că aplicația rulează accesând:
- API: http://localhost:3000/api/schools
- Swagger: http://localhost:3000/api-docs

## Note Importante

1. Asigură-te că ai PostgreSQL instalat și configurat corect
2. Folosește validare pentru toate input-urile
3. Implementează logging pentru debugging
4. Scrie teste pentru funcționalitățile importante
5. Urmează standardele de cod TypeScript
6. Documentează codul nou adăugat

## Următorii Pași

După implementarea cu succes a School Management Service, poți continua cu:
1. Adăugarea autentificării și autorizării
2. Implementarea altor microservicii (Students, Buses)
3. Adăugarea de funcționalități complexe (file upload, reporting)
4. Îmbunătățirea UI/UX
5. Implementarea testelor automate

## Resurse Utile

- [Documentație NestJS](https://docs.nestjs.com/)
- [Documentație Next.js](https://nextjs.org/docs)
- [Documentație TypeORM](https://typeorm.io/)
- [Documentație Swagger](https://swagger.io/docs/) 