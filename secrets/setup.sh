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
DIR="$(dirname "${BASH_SOURCE[0]}")"

if [[ "$FORCE_OVERWRITE" == "true" || ! -f "${DIR}/ha_db_root_password.txt" ]]; then
    readRequired "Enter root password" MYSQL_ROOT_PASSWORD
    echo -n $MYSQL_ROOT_PASSWORD > "${DIR}/ha_db_root_password.txt"
fi
if [[ "$FORCE_OVERWRITE" == "true" || ! -f "${DIR}/ha_db_user.txt" ]]; then
    readRequired "Enter database user" MYSQL_USER
    echo -n $MYSQL_USER> "${DIR}/ha_db_user.txt"
fi
if [[ "$FORCE_OVERWRITE" == "true" || ! -f "${DIR}/ha_db_password.txt" ]]; then
    readRequired "Enter database users password" MYSQL_PASSWORD
    echo -n $MYSQL_PASSWORD > "${DIR}/ha_db_password.txt"
fi