import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthStrategy } from './firebase-auth.strategy';
import { ConfigModule } from '../config/config.module';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [ConfigModule],
  providers: [AuthService, FirebaseAuthStrategy, AuthGuard, RolesGuard],
  exports: [AuthService, AuthGuard, RolesGuard],
})
export class AuthModule {} 