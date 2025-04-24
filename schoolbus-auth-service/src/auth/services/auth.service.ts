import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import { FirebaseAuthService } from './firebase-auth.service';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly firebaseAuthService: FirebaseAuthService,
  ) {}

  async login(firebaseToken: string) {
    try {
      // Verify the Firebase token
      const decodedToken = await this.firebaseAuthService.verifyFirebaseToken(firebaseToken);

      // Extract user information from Firebase token
      const { uid, email, name } = decodedToken;

      // Check if user exists in our database
      let user = await this.usersService.findByFirebaseUid(uid);

      // If user doesn't exist, create a new one
      if (!user) {
        // Get additional user details from Firebase if needed
        const firebaseUser = await this.firebaseAuthService.getUserByUid(uid);
        
        // Create new user in our database
        const names = name ? name.split(' ') : [email.split('@')[0], ''];
        const userDto: CreateUserDto = {
          firstName: names[0],
          lastName: names.length > 1 ? names.slice(1).join(' ') : '',
          email: email,
          firebaseUid: uid,
          // Add other default fields as needed
        };
        
        user = await this.usersService.create(userDto);
      } else {
        // Update last login time
        await this.usersService.updateLastLogin(user.id);
      }

      // Generate a JWT token
      const payload = { 
        sub: user.id, 
        email: user.email, 
        roles: [user.role],
        firebaseUid: user.firebaseUid
      };
      
      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        accessToken: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  async validateToken(token: string): Promise<User> {
    try {
      // Verify Firebase token
      const decodedToken = await this.firebaseAuthService.verifyFirebaseToken(token);
      
      // Find user by Firebase UID
      const user = await this.usersService.findByFirebaseUid(decodedToken.uid);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validateUser(email: string, firebaseUid: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user || user.firebaseUid !== firebaseUid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    return user;
  }
} 