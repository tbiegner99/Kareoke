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

readRequired "Enter path for kareoke_files volume. This is where te song videos are stored" FILES_PATH
echo "Creating '/mnt/volumes/kareoke_files' volume with path: $FILES_PATH"
docker volume rm kareoke_files 2>/dev/null || true
docker volume create --opt type=none --opt o=bind --opt device=$FILES_PATH kareoke_files