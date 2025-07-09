set -x
CMD=$1
case $CMD in 
    build)
    COMMAND="up -d --build"
    ;;
    start)
    COMMAND="up -d"
    ;;
    stop)
    COMMAND="down"
    ;;
    remove)
    COMMAND="rm"
    ;;
    install)
    COMMAND="run"
    ;;
    clean)
    COMMAND="run"
    ;;
esac

shift
if [ -z "$@" ]; then
    ARGS=$(find $KAREOKE_HOME/backend -type f -iname "docker-compose.yml" -exec printf ' -f %s ' '{}' +)

    ARGS="-f $KAREOKE_HOME/local-dev/docker-compose.services.yml -f $KAREOKE_HOME/ui/docker-compose.yml $ARGS"

    docker-compose -p kareoke $ARGS $COMMAND
else 
    ARGS="-f $KAREOKE_HOME/local-dev/docker-compose.services.yml "
    for ALIAS in $@
    do
        SERVICE=$($KAREOKE_HOME/local-dev/scripts/alias.sh $ALIAS)
        
        if [ "$SERVICE" = "kareoke-db" ]; then 
            COMPOSE_FILE="-f $KAREOKE_HOME/local-dev/docker-compose.infra.yml"
        elif [ "$SERVICE" = "kareoke-ui" ]; then
            COMPOSE_FILE="-f $KAREOKE_HOME/ui/docker-compose.yml"
        else
            COMPOSE_FILE=$(find $KAREOKE_HOME/backend/$SERVICE -type f -iname "docker-compose.yml" -exec printf ' -f %s ' '{}' +)
        fi

       
        if [ ! -z "$COMPOSE_FILE" ]; then
            docker stop $SERVICE 
            docker rm $SERVICE
            ARGS="$COMPOSE_FILE $ARGS"
            if [ "install" = "$CMD" ]; then
                COMMAND="$COMMAND --rm -w /srv/package/cmd $SERVICE go install"
            elif [ "clean" = "$CMD" ]; then
                COMMAND="$COMMAND --rm -w /srv/package $SERVICE go clean -modcache"
            fi
        else 
            echo "NO compose file for service $SERVICE. Ignoring..."
        fi
        
    done
    if [ ! -z "$ARGS" ]; then
        docker-compose  $ARGS -p kareoke $COMMAND
    fi
fi
