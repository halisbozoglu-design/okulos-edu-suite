# OkulOS Migration Policy

Canonical production baseline: `20260821153000`.

Rules:
- Never replay pre-baseline Lovable migrations from zero.
- Never edit an applied migration.
- Inspect Cloud schema first; apply only the smallest required forward-only SQL.
- Prefer idempotent DDL (`IF EXISTS` / `IF NOT EXISTS`) where PostgreSQL supports it.
- Every direct Cloud DB change must be committed to `supabase/migrations` with a unique 14-digit version.
- Verify the Cloud result after every write.
- Lovable AI agent is not used for database migrations; direct Cloud SQL is preferred.
- For a brand-new environment, produce a fresh schema dump/baseline from the canonical Cloud schema rather than replaying the legacy chain.

The one-time reconciliation migration is `20260821153000_cloud_ledger_reconciliation.sql`.
