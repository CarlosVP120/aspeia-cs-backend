#!/bin/bash

# Set variables
CONTAINER_NAME="aspeiacs-postgres"
POSTGRES_USER="admin"
POSTGRES_PASSWORD="36112154"
POSTGRES_DB="ASPEIA_CS"

# Run PostgreSQL container
echo "Creating PostgreSQL container..."
docker run --name $CONTAINER_NAME \
  -e POSTGRES_USER=$POSTGRES_USER \
  -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
  -e POSTGRES_DB=$POSTGRES_DB \
  -p 5432:5432 \
  -d postgres

# Wait for PostgreSQL to start up
echo "Waiting for PostgreSQL to start up..."
sleep 10

# Create schema and tables
echo "Creating database schema..."
docker exec -i $CONTAINER_NAME psql -U $POSTGRES_USER -d $POSTGRES_DB << EOF

-- Create schema
CREATE SCHEMA ASPEIA_CS;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA ASPEIA_CS TO $POSTGRES_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ASPEIA_CS TO $POSTGRES_USER;

EOF

echo "Database setup completed successfully!"