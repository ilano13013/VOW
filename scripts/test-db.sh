#!/usr/bin/env bash
# Applies the migrations to a throwaway database and runs supabase/tests.
# Usage: DATABASE_URL=postgres://postgres@localhost:54329/postgres npm run test:db
# (any local PostgreSQL ≥ 15 superuser connection; a database `vow_test` is recreated)
set -euo pipefail
: "${DATABASE_URL:?Set DATABASE_URL to a local PostgreSQL superuser connection}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TEST_URL="${DATABASE_URL%/*}/vow_test"
psql "$DATABASE_URL" -q -v ON_ERROR_STOP=1 -c 'drop database if exists vow_test' -c 'create database vow_test'
psql "$TEST_URL" -q -v ON_ERROR_STOP=1 -f "$ROOT/supabase/tests/00_supabase_shim.sql"
for f in "$ROOT"/supabase/migrations/*.sql; do
  psql "$TEST_URL" -q -v ON_ERROR_STOP=1 -f "$f"
done
psql "$TEST_URL" -v ON_ERROR_STOP=1 -f "$ROOT/supabase/tests/10_security.test.sql" 2>&1 | sed 's/^psql:[^ ]* NOTICE:  /  /'
