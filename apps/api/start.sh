#!/bin/bash
set -e

echo "Running database migrations..."
alembic upgrade head

echo "Seeding database (if empty)..."
python seed_db.py || echo "Seeding skipped or already done"

echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
