import fs from 'fs/promises';
import path from 'path';

const template = `import mongoose from 'mongoose';

export async function up() {
  // Add your migration logic here
  // Example: await mongoose.connection.db.collection('collection_name').createIndex(...);
}

export async function down() {
  // Add your rollback logic here
  // Example: await mongoose.connection.db.collection('collection_name').dropIndex(...);
}
`;

async function createMigration(name: string) {
  try {
    const timestamp = new Date().getTime();
    const fileName = `${timestamp}-${name}.ts`;
    const filePath = path.join(__dirname, '..', 'src', 'migrations', fileName);
    
    await fs.writeFile(filePath, template);
    console.log(`Created migration: ${fileName}`);
  } catch (error) {
    console.error('Failed to create migration:', error);
    process.exit(1);
  }
}

const migrationName = process.argv[2];
if (!migrationName) {
  console.error('Please provide a migration name');
  console.error('Usage: npm run db:create <migration-name>');
  process.exit(1);
}

createMigration(migrationName); 