import * as admin from 'firebase-admin';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SchoolsService } from './schools/schools.service';
import { StudentsService } from './students/students.service';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const schoolsService = app.get(SchoolsService);
  const studentsService = app.get(StudentsService);
  const authService = app.get(AuthService);

  // Create admin user
  try {
    const adminUser = await authService.createUser(
      'admin@schoolbus.com',
      'password123',
      'Admin User'
    );
    await authService.setUserRole(adminUser.uid, 'admin');
    console.log('Admin user created:', adminUser.uid);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  }

  // Create regular user
  try {
    const regularUser = await authService.createUser(
      'user@schoolbus.com',
      'password123',
      'Regular User'
    );
    await authService.setUserRole(regularUser.uid, 'user');
    console.log('Regular user created:', regularUser.uid);
  } catch (error) {
    console.error('Error creating regular user:', error.message);
  }

  // Create schools
  const schools = [
    {
      name: 'Central High School',
      address: '123 Main St',
      city: 'Metropolis',
      state: 'NY',
      postalCode: '10001',
      phone: '555-123-4567',
      email: 'info@centralhigh.edu',
      type: 'High School',
      geoLat: 40.7128,
      geoLng: -74.006,
    },
    {
      name: 'Westside Elementary',
      address: '456 Oak Ave',
      city: 'Metropolis',
      state: 'NY',
      postalCode: '10002',
      phone: '555-987-6543',
      email: 'info@westsideelem.edu',
      type: 'Elementary School',
      geoLat: 40.7218,
      geoLng: -74.016,
    },
  ];

  for (const schoolData of schools) {
    try {
      const school = await schoolsService.create(schoolData);
      console.log('School created:', school.id);

      // Create students for each school
      if (school.id) {
        const studentsData = [
          {
            schoolId: school.id,
            firstName: 'John',
            lastName: 'Doe',
            grade: school.type === 'High School' ? '10th' : '5th',
            guardianName: 'Jane Doe',
            guardianPhone: '555-111-2222',
            guardianEmail: 'jane.doe@example.com',
            address: '789 Pine St, Metropolis, NY 10003',
          },
          {
            schoolId: school.id,
            firstName: 'Alice',
            lastName: 'Smith',
            grade: school.type === 'High School' ? '11th' : '4th',
            guardianName: 'Bob Smith',
            guardianPhone: '555-333-4444',
            guardianEmail: 'bob.smith@example.com',
            address: '321 Elm St, Metropolis, NY 10004',
          },
        ];

        for (const studentData of studentsData) {
          const student = await studentsService.create(studentData);
          console.log('Student created:', student.id);
        }
      }
    } catch (error) {
      console.error('Error creating school or students:', error.message);
    }
  }

  console.log('Seed data created successfully');
  await app.close();
}

bootstrap(); 