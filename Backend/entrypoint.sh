#!/bin/bash
set -e

echo "Waiting for PostgreSQL at ${POSTGRES_HOST:-db}:${POSTGRES_PORT:-5432}..."

# Use pg_isready (included in postgres client) or fall back to Python
# Try up to 30 times (30 seconds)
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if python -c "
import socket, sys
try:
    s = socket.create_connection(('${POSTGRES_HOST:-db}', ${POSTGRES_PORT:-5432}), timeout=2)
    s.close()
    sys.exit(0)
except Exception:
    sys.exit(1)
" 2>/dev/null; then
        echo "PostgreSQL is up!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "PostgreSQL is unavailable – attempt $RETRY_COUNT/$MAX_RETRIES – sleeping 1s"
    sleep 1
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "ERROR: Could not connect to PostgreSQL after $MAX_RETRIES attempts"
    exit 1
fi

echo "Generating migrations..."
python manage.py makemigrations accounts --noinput
python manage.py makemigrations sessions bookings payments --noinput

echo "Applying migrations..."
python manage.py migrate --noinput

echo "Starting Gunicorn..."
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120
