#mkdir -p $KAREOKE_HOME/local-dev/postgres-data
docker-compose -p kareoke -f $KAREOKE_HOME/local-dev/docker-compose.infra.yml up -d
$KAREOKE_HOME/local-dev/scripts/services/service-command.sh start $@
