import { neon } from '@neondatabase/serverless'
export default defineEventHandler(async () => {
  const url = process.env.DATABASE_URL
  if (!url) return { configured: false, connected: false, mode: 'demo-localStorage' }
  try {
    const sql = neon(url)
    const rows = await sql`select 1 as connected`
    return { configured: true, connected: rows[0]?.connected === 1, mode: 'neon-postgres' }
  } catch {
    return { configured: true, connected: false, mode: 'neon-postgres', error: 'Connexion indisponible' }
  }
})
