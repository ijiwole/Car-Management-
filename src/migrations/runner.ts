import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

async function getMigrationFiles(): Promise<string[]> {
  const migrationsDir = path.join(__dirname);
  const files = await fs.readdir(migrationsDir);
  return files
    .filter(f => f.match(/^\d{13}-.*\.ts$/) && f !== 'runner.ts')
    .sort();
}

async function runMigrations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const files = await getMigrationFiles();
    if (files.length === 0) {
      console.log('No migrations found');
      return;
    }

    console.log('Running migrations...');
    
    for (const file of files) {
      const migration = require(path.join(__dirname, file));
      console.log(`Running migration: ${file}`);
      
      try {
        await migration.up();
        console.log(`✓ Completed: ${file}`);
      } catch (error) {
        console.error(`✗ Failed: ${file}`);
        console.error(error);
        process.exit(1);
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations }; 