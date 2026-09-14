import { neon } from '@neondatabase/serverless'
import { DB_URL_VARS, resolveDatabaseUrl } from './database-url'

let _sql = null

export function getDb() {
  if (!_sql) {
    const { url } = resolveDatabaseUrl()
    if (!url) {
      throw new Error(
        `No database connection string found. Set one of: ${DB_URL_VARS.join(', ')}`,
      )
    }
    _sql = neon(url)
  }
  return _sql
}
