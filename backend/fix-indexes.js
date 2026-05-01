import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function fixIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const db = mongoose.connection.db;
    const adminSessionsCollection = db.collection('adminsessions');

    console.log('Fetching current indexes for adminsessions...');
    const indexes = await adminSessionsCollection.indexes();
    console.log(indexes);

    for (const index of indexes) {
      if (index.name !== '_id_' && index.name !== 'token_1') {
        console.log(`Dropping index: ${index.name}`);
        await adminSessionsCollection.dropIndex(index.name);
      }
    }

    console.log('Done cleaning up indexes. Mongoose will rebuild the correct ones on next start.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixIndexes();
