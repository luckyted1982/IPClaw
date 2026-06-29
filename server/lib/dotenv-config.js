import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

const dbPath = path.resolve(__dirname, '../data/db.sqlite');
process.env.DATABASE_URL = `file:${dbPath}`;
console.log('DATABASE_URL resolved:', process.env.DATABASE_URL);