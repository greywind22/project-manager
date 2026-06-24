import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

module.exports = async () => {
  console.log('[Global Setup] Initialising test environment...');

  // Explicitly load .env.test configuration
  dotenv.config({ 
    path: path.resolve(__dirname, '../.env.test'), 
    override: true 
  });

  // Fallback default if DATABASE_URL isn't explicitly defined in .env.test
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test.db';

  try {
    console.log('Synchronising Prisma schema with test database');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    
    console.log('[Global Setup] Test database structure ready.\n');
  } catch (error) {
    console.error('[Global Setup] Failed to prepare test database:', error);
    process.exit(1);
  }
};