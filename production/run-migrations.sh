#!/usr/bin/env bash
set -euo pipefail

# Runs Liquibase database migrations against the production Postgres instance.
# Credentials come from secrets/*.txt (same files docker-compose reads) unless
# DB_USER / DB_PASSWORD are already set in the environment (e.g. by Jenkins
# credential bindings), which take precedence.

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$DIR/.." && pwd)"
CHANGELOG_DIR="$REPO_ROOT/database/kareoke"
DRIVERS_DIR="$DIR/.liquibase-drivers"

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-kareoke}"
POSTGRES_JDBC_VERSION="${POSTGRES_JDBC_VERSION:-42.7.4}"

if [[ -z "${DB_USER:-}" ]]; then
    DB_USER="$(cat "$REPO_ROOT/secrets/ha_db_user.txt")"
fi
if [[ -z "${DB_PASSWORD:-}" ]]; then
    DB_PASSWORD="$(cat "$REPO_ROOT/secrets/ha_db_password.txt")"
fi

# The official liquibase/liquibase image doesn't bundle a JDBC driver;
# download the Postgres driver once and mount it onto Liquibase's classpath.
mkdir -p "$DRIVERS_DIR"
DRIVER_JAR="$DRIVERS_DIR/postgresql-${POSTGRES_JDBC_VERSION}.jar"
if [[ ! -f "$DRIVER_JAR" ]]; then
    echo "Downloading Postgres JDBC driver ${POSTGRES_JDBC_VERSION}..."
    curl -fsSL \
        "https://repo1.maven.org/maven2/org/postgresql/postgresql/${POSTGRES_JDBC_VERSION}/postgresql-${POSTGRES_JDBC_VERSION}.jar" \
        -o "$DRIVER_JAR"
fi

echo "Running Liquibase migrations against ${DB_HOST}:${DB_PORT}/${DB_NAME} as ${DB_USER}"

docker run --rm \
    --network host \
    -v "$CHANGELOG_DIR:/liquibase/changelog" \
    -v "$DRIVER_JAR:/liquibase/lib/postgresql.jar" \
    -w /liquibase/changelog \
    liquibase/liquibase:5.0 \
    --changeLogFile=changelog-root.xml \
    --url="jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}" \
    --username="$DB_USER" \
    --password="$DB_PASSWORD" \
    update
