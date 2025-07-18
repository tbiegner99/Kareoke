#! /bin/bash
# touch ~/.bashrc
# touch ~/.zshrc
# sed -i 's/export KAREOKE_HOME=.*//g' ~/.bashrc
# sed -i 's/export KAREOKE_HOME=.*//g' ~/.zshrc
# echo "export KAREOKE_HOME=$(dirname $PWD)"
# echo "export KAREOKE_HOME=$(dirname $PWD)" >> ~/.bashrc
# echo "export KAREOKE_HOME=$(dirname $PWD)" >> ~/.zshrc
# source ~/.bashrc
# source ~/.zshrc

# source ~/.bashrc > /dev/null
# source ~/.zshrc > /dev/null

export KAREOKE_HOME=$(pwd)

readRequired() {
    while true; do
        echo $1
        read $2
        if [[ ${!2} =~ ^.+$ ]]; then
            break;
        elif [[ -z "${!2}" && -n "$3" ]]; then 
            printf -v $2 "$3" 
            break;
        else 
            echo 'This is required'
        fi
    done
}
EXISTING=$(docker volume ls | grep kareoke_files)
if [ -n "$EXISTING" ]; then
    docker volume rm kareoke_files
    echo "Removed existing kareoke_files volume."
fi
    readRequired "Enter path for kareoke_files volume. This is where te song videos are stored" FILES_PATH
    echo "Creating 'kareoke_files' volume with path: $FILES_PATH"
    docker volume create --opt type=none --opt o=bind --opt device=$FILES_PATH kareoke_files
 
 while getopts "s" opt; do
  case "$opt" in
    h|\?)
      echo "s - force secret overwrite. i f not provided secrets will be prompted if they dont exist"
      exit 0
      ;;
    s) OVERWRITE="true"
      ;;

  esac
done 

readRequired() {
    while true; do
        echo $1
        read $2
        if [[ ${!2} =~ ^.+$ ]]; then
            break;
        elif [[ -z "${!2}" && -n "$3" ]]; then 
            printf -v $2 "$3" 
            break;
        else 
            echo 'This is required'
        fi
    done
}
DIR="${KAREOKE_HOME}/secrets"
if [ ! -f "${DIR}/ha_db_user.txt" ]; then
    echo "Creating secrets"
    if [[ "$FORCE_OVERWRITE" == "true" || ! -f "${DIR}/ha_db_user.txt" ]]; then
        readRequired "Enter database user" MYSQL_USER
        echo -n $MYSQL_USER> "${DIR}/ha_db_user.txt"
    fi
    if [[ "$FORCE_OVERWRITE" == "true" || ! -f "${DIR}/ha_db_password.txt" ]]; then
        readRequired "Enter database users password" MYSQL_PASSWORD
        echo -n $MYSQL_PASSWORD > "${DIR}/ha_db_password.txt"

    fi
fi


echo "Creating network"
EXISTING_NETWORK=$(docker network ls | grep kareoke_prod)

if [ -z "$EXISTING_NETWORK" ]; then
    docker network create -d bridge kareoke_prod
    echo "Network 'kareoke_prod' created."
else
    echo "Network 'kareoke_prod' already exists."
fi

docker compose -f $KAREOKE_HOME/production/docker-compose.yml up -d 
   if [ $? -ne 0 ]; then
        docker compose -f $KAREOKE_HOME/production/docker-compose.yml down
        echo "Failed to create kareoke_files volume. Please check the path and try again."
        exit 1
    fi

#! /bin/bash
DB_USER=$(cat $KAREOKE_HOME/secrets/ha_db_user.txt)
DB_PASSWORD=$(cat $KAREOKE_HOME/secrets/ha_db_password.txt)


docker run -e PGPASSWORD=$DB_PASSWORD --network=kareoke_prod --rm jbergknoff/postgresql-client  psql -h kareoke-prod-db -d kareoke -U $DB_USER -p 5432 -c "DROP SCHEMA \"kareoke\" CASCADE; "


docker run -e PGPASSWORD=$DB_PASSWORD --network=kareoke_prod --rm jbergknoff/postgresql-client psql -h kareoke-prod-db -d kareoke -U $DB_USER -p 5432 -c "CREATE SCHEMA \"kareoke\";"


docker run -e PGPASSWORD=$DB_PASSWORD --network=kareoke_prod --rm jbergknoff/postgresql-client  psql -h kareoke-prod-db -d kareoke -U $DB_USER -p 5432 -c "ALTER SCHEMA public RENAME TO \"kareoke\"; "
docker run -v $KAREOKE_HOME/database/kareoke:/liquibase/lib --network=kareoke_prod liquibase/liquibase liquibase update  --username=$DB_USER --password=$DB_PASSWORD --url=jdbc:postgresql://kareoke-prod-db:5432/kareoke --changelogFile=changelog-root.xml


docker run -v $KAREOKE_HOME/local-dev/scripts/seed:/seed -e PGPASSWORD=$DB_PASSWORD --network=kareoke_prod --rm jbergknoff/postgresql-client  psql -h kareoke-prod-db -d kareoke -U $DB_USER -p 5432 -f "/seed/kareoke.sql"


echo "Kareoke setup complete. "
