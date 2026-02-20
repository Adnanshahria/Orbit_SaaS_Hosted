import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log('DB Connection attempting with:', { url: url ? 'Set' : 'Missing', authToken: authToken ? 'Set' : 'Missing' });

const db = createClient({
    url: url || '',
    authToken: authToken || '',
});

export default db;
