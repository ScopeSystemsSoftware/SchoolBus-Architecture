import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAuthService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    // Initialize Firebase Admin if not already initialized
    try {
      const firebaseConfig = this.configService.get('FIREBASE_CREDENTIALS');
      
      if (firebaseConfig) {
        // If FIREBASE_CREDENTIALS is a JSON string, parse it
        const credentials = typeof firebaseConfig === 'string'
          ? JSON.parse(firebaseConfig)
          : firebaseConfig;
          
        admin.initializeApp({
          credential: admin.credential.cert(credentials),
        });
      } else {
        // If credentials not found in env vars, try using the Google Application Default Credentials
        admin.initializeApp();
      }
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw new Error('Failed to initialize Firebase Admin SDK');
    }
  }

  async verifyFirebaseToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Firebase token verification error:', error);
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  async getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
    try {
      return await admin.auth().getUserByEmail(email);
    } catch (error) {
      console.error('Firebase getUserByEmail error:', error);
      throw new Error(`User with email ${email} not found in Firebase Auth`);
    }
  }

  async getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
    try {
      return await admin.auth().getUser(uid);
    } catch (error) {
      console.error('Firebase getUser error:', error);
      throw new Error(`User with UID ${uid} not found in Firebase Auth`);
    }
  }
} 