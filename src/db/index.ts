import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Lazily create the connection on first use so that importing this module
// during Next.js build-time analysis (e.g. collecting page data) does not
// throw when DATABASE_URL is absent from the build environment.
function createDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  const sql = neon(process.env.DATABASE_URL)
  return drizzle(sql, { schema })
}

type Db = ReturnType<typeof createDb>

let _db: Db | undefined

export const db: Db = new Proxy({} as Db, {
  get(_target, prop) {
    if (!_db) _db = createDb()
    return _db[prop as keyof Db]
  },
})
