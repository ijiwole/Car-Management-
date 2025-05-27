import mongoose from 'mongoose';

export async function up() {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database not connected');

  const collection = db.collection('cars');
  
  // Create compound index for brand and carModel
  await collection.createIndex(
    { brand: 1, carModel: 1 },
    { name: 'brand_carmodel_1' }
  );

  // Create index for price
  await collection.createIndex(
    { price: 1 },
    { name: 'price_1' }
  );

  // Create index for status
  await collection.createIndex(
    { status: 1 },
    { name: 'status_1' }
  );

  console.log('Created indexes on cars collection');
}

export async function down() {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database not connected');

  const collection = db.collection('cars');
  
  // Drop all indexes except _id
  await collection.dropIndexes();
  
  console.log('Dropped all indexes from cars collection');
}
