import postgres from 'postgres'
import { DB_URL_VARS, resolveDatabaseUrl } from './database-url'
import { connectionOptions } from './db-options'

let _sql = null

export function getDb() {
  if (!_sql) {
    const { url } = resolveDatabaseUrl()
    if (!url) {
      throw new Error(
        `No database connection string found. Set one of: ${DB_URL_VARS.join(', ')}`,
      )
    }
    _sql = postgres(url, connectionOptions(url))
  }
  return _sql
}

// Runs a fixed DDL statement from our own source. The tagged-template form is
// for parameterised queries and can't express this, so it goes through the
// driver's explicit escape hatch rather than a faked template object.
export function runRaw(sql, text) {
  return sql.unsafe(text)
}
