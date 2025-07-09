cd $KAREOKE_HOME/database/kareoke

if [[ -z "$1" ]]; then
    echo "Pass a description of changes as first arg"
    exit 1
fi

xmlstarlet --version

if [[ "$?" != "0" ]]; then
echo "xmlstarlet not installed. Install it."
exit 4;
fi

docker run -e INSTALL_MYSQL=true -v $KAREOKE_HOME/database/kareoke/changelogs:/liquibase/changelogs -v $KAREOKE_HOME/database/kareoke:/liquibase/root --network=kareoke_local liquibase/liquibase \
 liquibase --changelog-file=/liquibase/root/changelog-root.xml diff-changelog \
--reference-url=jdbc:mysql://192.168.2.209/kareoke \
--reference-username root --reference-password gomets99 \
--url=jdbc:postgresql://kareoke-db/kareoke \
--username kareoke \
--password kareoke && pwd &&ls;

# open develop
# liquibase --changelog-file=changelog-root.xml diff-changelog \
# --url=jdbc:mysql://192.168.2.209/kareoke \
# --username kareoke --password kareoke \
# --reference-url=jdbc:postgresql://127.0.0.1/kareoke \
# --reference-username kareoke \
# --reference-password kareoke;

FILENAME="$(date -I)-${1}.xml"
 CONTENT=`xmlstarlet sel -N xsi="http://www.liquibase.org/xml/ns/dbchangelog" -t -c "/xsi:databaseChangeLog/xsi:changeSet"  changelog-root.xml`


xmlstarlet ed -L -N xsi="http://www.liquibase.org/xml/ns/dbchangelog" \
 -d "/xsi:databaseChangeLog/xsi:changeSet" \
 -s "/xsi:databaseChangeLog" -t elem -n includeTMP \
 -i "//includeTMP" -t attr -n "file" -v "changelogs/${FILENAME}" \
 -r //includeTMP -v include changelog-root.xml

echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<databaseChangeLog
   xmlns=\"http://www.liquibase.org/xml/ns/dbchangelog\"
   xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"
   xmlns:pro=\"http://www.liquibase.org/xml/ns/pro\"
   xsi:schemaLocation=\"http://www.liquibase.org/xml/ns/dbchangelog
      http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.1.xsd
      http://www.liquibase.org/xml/ns/pro 
      http://www.liquibase.org/xml/ns/pro/liquibase-pro-4.1.xsd\">

${CONTENT}

</databaseChangeLog>" > changelogs/$FILENAME

 (cat changelogs/$FILENAME | xml tr $KAREOKE_HOME/local-dev/scripts/utils/sort-changesets.xml | xml fo --nsclean) > tmp.xml 
  mv tmp.xml changelogs/$FILENAME

# cat changelogs/$FILENAME | xml fo --nsclean > changelogs/$FILENAME