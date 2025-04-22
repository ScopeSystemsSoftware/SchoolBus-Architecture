import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor() {
    const envFilePath = path.resolve(process.cwd(), '.env');
    this.envConfig = dotenv.parse(fs.existsSync(envFilePath) ? fs.readFileSync(envFilePath) : '');
  }

  get(key: string): string {
    return this.envConfig[key] || process.env[key];
  }

  getFirebaseConfig(): any {
    return {
      apiKey: this.get('FIREBASE_API_KEY'),
      authDomain: this.get('FIREBASE_AUTH_DOMAIN'),
      projectId: this.get('FIREBASE_PROJECT_ID'),
      storageBucket: this.get('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: this.get('FIREBASE_MESSAGING_SENDER_ID'),
      appId: this.get('FIREBASE_APP_ID'),
    };
  }

  getDatabaseConfig(): any {
    return {
      type: 'postgres',
      host: this.get('DB_HOST') || 'localhost',
      port: parseInt(this.get('DB_PORT')) || 5432,
      username: this.get('DB_USERNAME') || 'postgres',
      password: this.get('DB_PASSWORD') || 'postgres',
      database: this.get('DB_NAME') || 'schoolbus_poc',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: this.get('NODE_ENV') !== 'production',
    };
  }
} 