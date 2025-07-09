#! /bin/bash
touch ~/.bashrc
touch ~/.zshrc
sed -i 's/export KAREOKE_HOME=.*//g' ~/.bashrc
sed -i 's/export KAREOKE_HOME=.*//g' ~/.zshrc
sed -i 's/export GCP_KEY_PATH=.*//g' ~/.bashrc
sed -i 's/export GCP_KEY_PATH=.*//g' ~/.zshrc
echo "export KAREOKE_HOME=$(dirname $PWD)"
echo "export KAREOKE_HOME=$(dirname $PWD)" >> ~/.bashrc
echo "export KAREOKE_HOME=$(dirname $PWD)" >> ~/.zshrc
echo "export GCP_KEY_PATH=$(dirname $PWD)/local-dev/gcp-key/keyfile.json" >> ~/.bashrc
echo "export GCP_KEY_PATH=$(dirname $PWD)/local-dev/gcp-key/keyfile.json" >> ~/.zshrc
source ~/.bashrc
source ~/.zshrc

echo "Creating network"
EXISTING_NETWORK=$(docker network ls | grep kareoke_local)

if [ -z "$EXISTING_NETWORK" ]; then
    docker network create -d bridge kareoke_local
    echo "Network 'kareoke_local' created."
else
    echo "Network 'kareoke_local' already exists."
fi