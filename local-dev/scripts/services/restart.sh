#!/bin/bash

SERVICE_LIST=$@
if [ -z "$@" ]; then
    source $KAREOKE_HOME/local-dev/scripts/utils/all-services.sh
    SERVICE_LIST=$ALL_SERVICES;
fi
    echo
    for SERVICE_ALIAS in ${SERVICE_LIST[@]}
    do
    echo "$SERVICE_ALIAS"
        SERVICE=$($KAREOKE_HOME/local-dev/scripts/alias.sh $SERVICE_ALIAS)
        echo "RESTARTING $SERVICE"
        
        docker restart $SERVICE;
    done
