# Supabase Database Commands

## Prerequisites

Supabase CLI is located at: `node_modules/supabase/bin/supabase`

## Link Project

```bash
node_modules/supabase/bin/supabase link --project-ref tztgrttjuawbqvwzteae
```

## Backup

**Download schema:**
```bash
node_modules/supabase/bin/supabase db dump --linked -f schema.sql
```

**Download data:**
```bash
node_modules/supabase/bin/supabase db dump --linked --data-only -f data.sql
```

## Restore

**Restore schema:**
```bash
psql "postgresql://postgres:[PASSWORD]@db.tztgrttjuawbqvwzteae.supabase.co:5432/postgres" -f schema.sql
```

**Restore data:**
```bash
psql "postgresql://postgres:[PASSWORD]@db.tztgrttjuawbqvwzteae.supabase.co:5432/postgres" -f data.sql
```

Replace `[PASSWORD]` with your database password from Supabase Dashboard (Settings > Database).
