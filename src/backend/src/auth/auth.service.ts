import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '../config/config.service';

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {
    // Initialize Firebase Admin SDK if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: this.configService.get('FIREBASE_PROJECT_ID'),
      });
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async getUserByEmail(email: string): Promise<any> {
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      return userRecord;
    } catch (error) {
      throw new Error('User not found');
    }
  }

  async createUser(email: string, password: string, displayName: string): Promise<any> {
    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName,
      });
      return userRecord;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async setUserRole(uid: string, role: string): Promise<void> {
    try {
      await admin.auth().setCustomUserClaims(uid, { role });
    } catch (error) {
      throw new Error(`Error setting user role: ${error.message}`);
    }
  }
} 