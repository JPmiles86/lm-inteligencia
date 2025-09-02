/**
 * Test database connection and provider settings
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { providerSettings } from '../src/db/schema';

export default async function handler(req: any, res: any) {
  let sql: any;
  
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      return res.status(500).json({ error: 'DATABASE_URL not configured' });
    }

    sql = postgres(connectionString, {
      ssl: 'require',
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10
    });
    
    const db = drizzle(sql);

    // Try to fetch provider settings
    const providers = await db
      .select({
        provider: providerSettings.provider,
        active: providerSettings.active,
        hasKey: providerSettings.apiKeyEncrypted
      })
      .from(providerSettings);

    await sql.end();

    return res.status(200).json({
      success: true,
      providers: providers.map(p => ({
        provider: p.provider,
        active: p.active,
        hasKey: !!p.hasKey
      }))
    });
  } catch (error: any) {
    if (sql) {
      try {
        await sql.end();
      } catch {}
    }
    
    return res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}