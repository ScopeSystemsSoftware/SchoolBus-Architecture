import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { AuthService } from '../services/auth.service';

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(Strategy, 'firebase-auth') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(token: string): Promise<any> {
    try {
      const user = await this.authService.validateToken(token);
      if (!user) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
} 