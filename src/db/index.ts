import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// neon() only stores the URL — no connection is made until a query runs.
// The placeholder fallback lets this module be safely imported during
// Next.js build-time analysis. Any actual query without DATABASE_URL
// will fail at runtime as expected.
const sql = neon(process.env.DATABASE_URL ?? 'postgresql://placeholder/placeholder')

export const db = drizzle(sql, { schema })
