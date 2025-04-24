import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with Firebase token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful, returns user info and JWT token.',
  })
  @ApiResponse({ status: 401, description: 'Invalid Firebase token.' })
  async login(@Body() body: { firebaseToken: string }) {
    return this.authService.login(body.firebaseToken);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return the user profile.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token.' })
  async getProfile(@Req() req) {
    // The user is attached to request by the AuthGuard
    const user = req.user;
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }
} 