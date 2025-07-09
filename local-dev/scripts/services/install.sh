
if [ "$1" = "clean" ]; then
    shift
    $KAREOKE_HOME/local-dev/scripts/services/service-command.sh clean $@
fi
$KAREOKE_HOME/local-dev/scripts/services/service-command.sh install $@
$KAREOKE_HOME/local-dev/scripts/services/service-command.sh start $@
