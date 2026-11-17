import { readFileSync } from 'node:fs';

// DB_SSL=true enables TLS with certificate verification.
// DB_SSL_CA (optional) is a path to a CA certificate, e.g. Supabase's root CA.
export function getSslOptions(env: Record<string, string | undefined>) {
  if (env.DB_SSL !== 'true') return false;
  return env.DB_SSL_CA ? { ca: readFileSync(env.DB_SSL_CA, 'utf8') } : true;
}
