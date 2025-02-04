#!/bin/sh
# filepath: /Users/vogiaan/Coding/projects/TicketBottle/entrypoint.sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Run database migrations
npx prisma migrate deploy

# Seed the database (ensure seeding is idempotent)
npx prisma db seed

# Start the application
exec "$@"