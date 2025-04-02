import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

// Import module-uri
import { AuthModule } from './modules/auth/auth.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { StudentsModule } from './modules/students/students.module';
import { BusesModule } from './modules/buses/buses.module';
import { RoutesModule } from './modules/routes/routes.module';
import { HealthModule } from './modules/health/health.module';
import { LiveTrackingModule } from './modules/live-tracking/live-tracking.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';

// Import multi-tenant components
import { TenantModule } from './modules/tenant/tenant.module';
import { TenantInterceptor } from './modules/tenant/interceptors/tenant.interceptor';
import { TenantGuard } from './modules/tenant/guards/tenant.guard';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';

// Import entități
import { School } from './modules/schools/entities/school.entity';
import { Student } from './modules/students/entities/student.entity';
import { Bus } from './modules/buses/entities/bus.entity';
import { Route } from './modules/routes/entities/route.entity';
import { User } from './modules/auth/entities/user.entity';
import { Tenant } from './modules/tenant/entities/tenant.entity';

@Module({
  imports: [
    // Config module pentru variabile de mediu
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    
    // Logger
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production' ? {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        } : undefined,
        customProps: (req) => ({
          tenantId: req.headers['x-tenant-id'] || 'unknown',
        }),
      },
    }),
    
    // Rate limiting pentru protecție
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,
    }),
    
    // TypeORM pentru conexiunea la baza de date
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: +configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'schoolbus'),
        entities: [School, Student, Bus, Route, User, Tenant],
        synchronize: configService.get('DB_SYNCHRONIZE', 'false') === 'true',
        logging: configService.get('DB_LOGGING', 'false') === 'true',
        ssl: configService.get('DB_SSL', 'false') === 'true' ? {
          rejectUnauthorized: false,
        } : false,
      }),
    }),
    
    // GraphQL pentru queries complexe și admin
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      context: ({ req }) => ({ req }),
    }),
    
    // Module aplicație
    TenantModule,
    AuthModule,
    SchoolsModule,
    StudentsModule,
    BusesModule,
    RoutesModule,
    HealthModule,
    LiveTrackingModule,
    NotificationsModule,
    AdminModule,
  ],
  providers: [
    // Interceptor pentru adăugare tenant în toate request-urile
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
    
    // Guard pentru validare tenant
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
    
    // Rate limiting global
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    
    // Exception filter global
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {} 