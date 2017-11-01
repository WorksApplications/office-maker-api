npm install
cd common
npm install
cd ../functions/authorizer/
npm install
cd ../../
echo  "'aws:SourceIp':\n\t- 0.0.0.0/0" > sourceIp.yaml
echo "" > functions/authorizer/pubkey.pem
echo "" > functions/authorizer/guest_token.json
echo "http://" > AccessControlAllowOrigin
echo "https://" > ProfileServiceRoot
