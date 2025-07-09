#!/bin/bash

case $1 in 
    pull-device-db | pddb)
        shift
        $KAREOKE_HOME/local-dev/scripts/utils/pull-device-db.sh $@
        ;;
    secrets | ss)
        shift
        $KAREOKE_HOME/backend/secrets/setup.sh $@
        ;;
    alias)
        shift
        $KAREOKE_HOME/local-dev/scripts/alias.sh $@
        ;;
     sh)
        shift
        SERVICE=$($KAREOKE_HOME/local-dev/scripts/alias.sh $1)
        shift
        docker exec -it $SERVICE sh
        ;;

     exec | e)
        shift
        SERVICE=$($KAREOKE_HOME/local-dev/scripts/alias.sh $1)
        shift
        docker exec -it $SERVICE $@
        ;;
    clean-install | ci)
        shift
        $KAREOKE_HOME/local-dev/scripts/services/install.sh clean $@
        ;;
    install | ci)
        shift
        $KAREOKE_HOME/local-dev/scripts/services/install.sh $@
        ;;
    logs | l) 
        shift
        $KAREOKE_HOME/local-dev/scripts/utils/log.sh $@
    ;;
    start | s)
        shift
        $KAREOKE_HOME/local-dev/scripts/services/start.sh $@
    ;;
    stop | x)
        shift
        $KAREOKE_HOME/local-dev/scripts/services/stop.sh $@
    ;;
    rebuild | rb)
        shift
        $KAREOKE_HOME/local-dev/scripts/services/rebuild.sh $@
    ;;

    db-reset | reset-db | dbr)
        shift;
        $KAREOKE_HOME/local-dev/scripts/setup/reset-db.sh $@
        ;;
    db-migrate | migrate-db | dbm)
        $KAREOKE_HOME/local-dev/scripts/setup/update-db.sh
        ;;
    db-update | dbu)
        $KAREOKE_HOME/local-dev/scripts/setup/update-db.sh
        ;;

    generate-changeset | dbcs | gcs)
        shift;
        $KAREOKE_HOME/local-dev/scripts/utils/generate-changeset.sh $@
        ;;

    restart | r) 
        shift
        $KAREOKE_HOME/local-dev/scripts/services/restart.sh $@
    ;;
    help | h | *)
        echo "Usage: kareoke <command> <commmand-args>"
        echo "Commands:"    
        echo "  pull-device-db | pddb               Pull device db. Optionally open it in system viewer."
        echo "  alias                               List all aliases or get alias for a service."
        echo "  sh                                  Run sh in a service container."
        echo "  exec | e                            Run a command in a service container."
        echo "  clean-install                       Clean install all services."
        echo "  install | ci                        Install kareoke services and scripts. Also sets up networks and db."
        echo "  logs | l                            Follow logs of a service."
        echo "  start | s                           Start a service"
        echo "  secrets | ss                        Setup secrets for kareoke services."
        echo "  stop | x                            Stop a service"
        echo "  rebuild | rb                        Executes a docker rebuild a service"
        echo "  dump-dev | dump                     Creates a postgres dump of kareoke database in develop"
        echo "  db-reset | reset-db | dbr           deletes all database data and resets it to latest snapshot of develop"
        echo "  db-migrate | migrate-db | dbm       Migrate database to latest version"
        echo "  db-update | dbu"
        echo "  setup-ui | uis"
        echo "  generate-changeset | dbcs | gcs     generates a changeset for a database, comparing local to develop"
        echo "  restart | r                         Restart a service"
        echo "  help | h                            Show this help message"
        ;;
esac