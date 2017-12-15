npm install
npm install common/
npm install functions/authorizer/
cp defaultConfig.yml config.yml
echo '"tmp"' > functions/authorizer/pubkey.pem
echo '{\n\t"GUEST_TOKEN": "tmp"\n}' > functions/authorizer/guest_token.json
mkdir migrations
echo '[\n\t{\n\t\t"color":"#a75",\n\t\t"ord":0,\n\t\t"type":"color",\n\t\t"id":"0",\n\t\t"tenantId":"worksap.co.jp"\n\t},\n\t{\n\t\t"color":"#75a",\n\t\t"ord":1,\n\t\t"type":"color",\n\t\t"id":"1",\n\t\t"tenantId":"worksap.co.jp"\n\t}\n]' > migrations/ColorsTable.json
echo '[\n\t{\n\t\t"color":"#000",\n\t\t"tenantId":"worksap.co.jp",\n\t\t"width":56,\n\t\t"shape":"rectangle",\n\t\t"fontSize":20,\n\t\t"backgroundColor":"#eee",\n\t\t"height":96,\n\t\t"id":"1"\n\t},\n\t{\n\t\t"color":"#000",\n\t\t"tenantId":"worksap.co.jp",\n\t\t"width":96,\n\t\t"shape":"rectangle",\n\t\t"fontSize":20,\n\t\t"backgroundColor":"#eee",\n\t\t"height":56,\n\t\t"id":"2"\n\t}\n]' > migrations/PrototypesTable.json
echo '[]' > migrations/EditFloorsTable.json
echo '[]' > migrations/PublicFloorsTable.json
echo '[]' > migrations/EditObjectsTable.json
echo '[]' > migrations/PublicObjectsTable.json
sls dynamodb install
