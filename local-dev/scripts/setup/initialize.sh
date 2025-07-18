#! /bin/bash

echo "Setting up kareoke_files volume"
$KAREOKE_HOME/local-dev/scripts/setup/setup-volume.sh
echo "Setting up secrets"
$KAREOKE_HOME/secrets/setup.sh
echo "starting services"
$KAREOKE_HOME/local-dev/scripts/services/start.sh

echo "Setting up database"
$KAREOKE_HOME/local-dev/scripts/setup/reset-db.sh

echo "Initialization complete. "
