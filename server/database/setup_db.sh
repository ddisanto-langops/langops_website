#!/usr/bin/env bash
set -euo pipefail

echo "=== LangOps Database Setup ==="
echo ""

# ── User input ────────────────────────────────────────────────────────────────
read -rp "PostgreSQL host [localhost]: " DB_HOST
DB_HOST="${DB_HOST:-localhost}"

read -rp "PostgreSQL port [5432]: " DB_PORT
DB_PORT="${DB_PORT:-5432}"

read -rp "PostgreSQL superuser (for creating DB/user) [postgres]: " PG_ADMIN_USER
PG_ADMIN_USER="${PG_ADMIN_USER:-postgres}"

read -rp "Database name to create [langops]: " DB_NAME
DB_NAME="${DB_NAME:-langops}"

read -rp "App DB user to create [langops_user]: " DB_USER
DB_USER="${DB_USER:-langops_user}"

read -rsp "Password for '$DB_USER': " DB_PASS
echo ""
read -rsp "Confirm password: " DB_PASS_CONFIRM
echo ""

if [[ "$DB_PASS" != "$DB_PASS_CONFIRM" ]]; then
  echo "Error: passwords do not match." >&2
  exit 1
fi

# ── Run DDL ───────────────────────────────────────────────────────────────────
echo ""
echo "Connecting to PostgreSQL as '$PG_ADMIN_USER' on $DB_HOST:$DB_PORT ..."

psql -h "$DB_HOST" -p "$DB_PORT" -U "$PG_ADMIN_USER" -v ON_ERROR_STOP=1 <<SQL

-- Create role/user (skip if already exists)
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE ROLE "$DB_USER" WITH LOGIN PASSWORD '$DB_PASS';
  ELSE
    RAISE NOTICE 'Role "$DB_USER" already exists, skipping creation.';
  END IF;
END
\$\$;

-- Create database (skip if already exists)
SELECT 'CREATE DATABASE "$DB_NAME" OWNER "$DB_USER"'
  WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = '$DB_NAME')
\gexec

SQL

# Connect to the target DB and create tables
psql -h "$DB_HOST" -p "$DB_PORT" -U "$PG_ADMIN_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 <<SQL

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE "$DB_NAME" TO "$DB_USER";
GRANT ALL ON SCHEMA public TO "$DB_USER";

-- ── products table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id              SERIAL          PRIMARY KEY,
    title           TEXT            NOT NULL UNIQUE,
    productCode     TEXT,
    targetLang      TEXT,
    productStatus   TEXT,
    crowdinUrl      TEXT,
    trelloUrl       TEXT,
    article_url     TEXT,
    editor_url      TEXT,
    due             TIMESTAMPTZ,
    lastActivity    TIMESTAMPTZ,
    published       BOOLEAN,
    translationProg INT,
    approvalProg    INT,
    mediaType       TEXT[],
    wordCount       INT
);

-- ── completions table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS completions (
    id              SERIAL          PRIMARY KEY,
    title           TEXT            NOT NULL UNIQUE,
    productCode     TEXT,
    targetLang      TEXT,
    mediaType       TEXT[],
    wordCount       INT,
    datePublished   TIMESTAMPTZ,
    trello_url      TEXT,
    article_url     TEXT,
    editor_url      TEXT,
    dateArchived    TIMESTAMPTZ
);

GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO "$DB_USER";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "$DB_USER";

SQL

echo ""
echo "Done. Database '$DB_NAME' is ready with tables: products, completions."
echo ""
echo "Add the following to your .env file:"
echo "  dbHost=$DB_HOST"
echo "  dbPort=$DB_PORT"
echo "  dbName=$DB_NAME"
echo "  dbUser=$DB_USER"
echo "  databasePassword=<the password you entered>"
