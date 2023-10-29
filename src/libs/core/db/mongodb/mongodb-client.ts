import 'dotenv/config';
import { MongoClient } from 'mongodb';

// Replace the uri string with your connection string.
const uri = process.env.MONGO_DB_CONN_STR as string;

export const mongoDbClient = new MongoClient(uri);