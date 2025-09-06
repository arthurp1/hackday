// Neon Serverless Postgres storage for a single JSONB state row
// Dynamically imports @neondatabase/serverless to avoid hard dependency errors
// Set VITE_NEON_DATABASE_URL in your env (e.g. .env.local) to enable.

const NEON_URL = import.meta.env.VITE_NEON_DATABASE_URL as string | undefined;

export const hasNeon = () => typeof NEON_URL === 'string' && NEON_URL.length > 0;

async function getClient(): Promise<any> {
  if (!hasNeon()) throw new Error('NEON url missing');
  // Dynamically import to prevent TS/build errors if package not installed yet
  const mod: any = await import('@neondatabase/serverless');
  const { neon, neonConfig } = mod;
  neonConfig.fetchConnectionCache = true;
  return neon(NEON_URL!);
}

export async function ensureSchema() {
  const sql = await getClient();
  await sql`
    create table if not exists app_state (
      id text primary key default 'main',
      data jsonb not null,
      updated_at timestamptz not null default now()
    );
  `;
}

export async function loadStateFromDB(): Promise<any | null> {
  if (!hasNeon()) return null;
  const sql = await getClient();
  await ensureSchema();
  const rows = await sql`select data from app_state where id = 'main'` as unknown as Array<{ data: any }>;
  if (!rows || (rows as any).length === 0) return null;
  return (rows as any)[0]?.data ?? null;
}

export async function saveStateToDB(data: any): Promise<void> {
  if (!hasNeon()) return;
  const sql = await getClient();
  await ensureSchema();
  await sql`
    insert into app_state (id, data)
    values ('main', ${data}::jsonb)
    on conflict (id) do update set data = excluded.data, updated_at = now();
  `;
}
