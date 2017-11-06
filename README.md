# office-maker-api
## Initialization
1. Installing
  - ```sh init.sh```
2. Configuration
  - sourceIp.yaml
    - ip address which you allow to access
  - functions/authorizer/pubkey.pem
    - publickey which is used to decode token
  - functions/authorizer/guest_token.json
    - this is special token for guest user
  - ProfileServiceRoot
    - URL for ProfileServiceRoot
3. DynamoDB Initial Data
  - you can add inital data under ```migrations```

## How to run
```sls offline start```
  - API Gateway Offline URL:  ```http://localhost:8000```
  - Dynamo Local URL: ```http://localhost:3000```
  <!-- - S3 Bucket Local URL: ```http://localhost:6000``` -->

## Deployment
```sls deploy -v -s <stage name>```

## Removement
```sls remove -v -s <stage name>```
