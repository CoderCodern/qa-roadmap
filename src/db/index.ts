import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// neon() validates the URL at call time, so it must not be called at module
// load time (Next.js evaluates route modules during "Collecting page data").
// Only the import of the neon function is safe here — the call is deferred.
type Db = ReturnType<typeof drizzle<typeof schema>>

let _db: Db | undefined

export function getDb(): Db {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    const sql = neon(process.env.DATABASE_URL)
    _db = drizzle(sql, { schema })
  }
  return _db
}

// Proxy provides the same `db` export that service files use unchanged.
// Each property access is forwarded to the lazily-created real Drizzle
// instance, so drizzle-orm symbol checks (used by DrizzleAdapter) resolve
// against the real object, not the empty Proxy target.
export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver)
  },
})
