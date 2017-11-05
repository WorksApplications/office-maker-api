npm install
npm install common/
npm install functions/authorizer/
echo  '"aws:SourceIp":\n\t- 0.0.0.0/0' > sourceIp.yaml
echo '"tmp"' > functions/authorizer/pubkey.pem
echo '{\n\t"GUEST_TOKEN": "tmp"\n}' > functions/authorizer/guest_token.json
echo "http://localhost" > ProfileServiceRoot
echo '[\n\t{\n\t\t"tenantId": "worksap.co.jp",\n\t\t"id": "1"\n\t}\n]' > migrations/ColorsTable.json
echo '[\n\t{\n\t\t"tenantId": "worksap.co.jp",\n\t\t"id": "1"\n\t}\n]' > migrations/EditFloorsTable.json
echo '[\n\t{\n\t\t"tenantId": "worksap.co.jp",\n\t\t"id": "1"\n\t}\n]' > migrations/PrototypesTable.json
echo '[\n\t{\n\t\t"tenantId": "worksap.co.jp",\n\t\t"id": "1"\n\t}\n]' > migrations/PublicFloorsTable.json
echo '[\n\t{\n\t\t"floorId": "1",\n\t\t"id": "1",\n\t\t"personId": "office-maker@worksap.co.jp"\n\t}\n]' > migrations/EditObjectsTable.json
echo '[\n\t{\n\t\t"floorId": "1",\n\t\t"id": "1",\n\t\t"personId": "office-maker@worksap.co.jp"\n\t}\n]' > migrations/PublicObjectsTable.json
