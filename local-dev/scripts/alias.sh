case $1 in 
ui|frontend|f|fe) 
    echo "kareoke-ui"
    ;;
be|b|backend|k) 
    echo "kareoke"
    ;;
db|db|database|postgres|p) 
    echo "kareoke-db"
    ;;
rtsp|r) 
    echo "rtsp"
    ;;
*) 
    echo "$1"
    ;;

esac