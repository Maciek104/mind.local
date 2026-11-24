
import { randomBytes } from 'crypto';
import {
  existsSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');

export function setupEnvironment() {
  if (!existsSync(envPath)) {
    const jwtSecret = randomBytes(64).toString('hex');

    const envContent = [
      `JWT_SECRET=${jwtSecret}`,
      'NODE_ENV=development',
    ].join('\n');

    writeFileSync(envPath, envContent, {
      encoding: 'utf-8',
      flag: 'wx',
    });

    console.log('Environment configuration created.');
  }

  const envContent = readFileSync(envPath, 'utf-8');

  for (const line of envContent.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing in .env');
  }
}
