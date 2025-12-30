#!/bin/sh
# Conditionally run migrations only if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL found, running migrations..."
  pnpm db:migrate:deploy
else
  echo "DATABASE_URL not set, skipping migrations..."
  echo "Note: Migrations should be run separately after setting DATABASE_URL"
fi

