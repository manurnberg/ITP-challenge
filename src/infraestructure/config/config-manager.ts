import * as dotenv from 'dotenv';
dotenv.config();

export class ConfigManager {
  static get(key: string, fallback?: string): string {
    const value = process.env[key] ?? fallback;
    if (value === undefined) {
      throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
  }

  static getNumber(key: string, fallback?: number): number {
    const val = this.get(key, fallback?.toString());
    const num = Number(val);
    if (isNaN(num)) throw new Error(`Invalid number for env var ${key}`);
    return num;
  }
}
