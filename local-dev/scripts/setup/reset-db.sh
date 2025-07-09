#! /bin/bash
DB_USER=$(cat $KAREOKE_HOME/secrets/ha_db_user.txt)
DB_PASSWORD=$(cat $KAREOKE_HOME/secrets/ha_db_password.txt)


docker run -e PGPASSWORD=$DB_PASSWORD --network=kareoke_local --rm jbergknoff/postgresql-client  psql -h kareoke-db -d kareoke -U $DB_USER -p 5432 -c "DROP SCHEMA \"kareoke\" CASCADE; "


docker run -e PGPASSWORD=$DB_PASSWORD --network=kareoke_local --rm jbergknoff/postgresql-client psql -h kareoke-db -d kareoke -U $DB_USER -p 5432 -c "CREATE SCHEMA \"kareoke\";"


docker run -e PGPASSWORD=$DB_PASSWORD --network=kareoke_local --rm jbergknoff/postgresql-client  psql -h kareoke-db -d kareoke -U $DB_USER -p 5432 -c "ALTER SCHEMA public RENAME TO \"kareoke\"; "
docker run -v $KAREOKE_HOME/database/kareoke:/liquibase/lib --network=kareoke_local liquibase/liquibase liquibase update  --username=$DB_USER --password=$DB_PASSWORD --url=jdbc:postgresql://kareoke-db:5432/kareoke --changelogFile=changelog-root.xml


docker run -v $KAREOKE_HOME/local-dev/scripts/seed:/seed -e PGPASSWORD=$DB_PASSWORD --network=kareoke_local --rm jbergknoff/postgresql-client  psql -h kareoke-db -d kareoke -U $DB_USER -p 5432 -f "/seed/kareoke.sql"
