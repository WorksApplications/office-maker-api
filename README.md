# office-maker-api
[![Build Status](https://api.travis-ci.org/WorksApplications/office-maker.svg)](https://travis-ci.org/WorksApplications/office-maker-api) [![Greenkeeper badge](https://badges.greenkeeper.io/WorksApplications/office-maker-api.svg)](https://greenkeeper.io/)

## Architecture
![Architecture](https://github.com/WorksApplications/office-maker-api/blob/master/images/map.png)
## Getting Started
[Node.js](https://nodejs.org/) (>= 6.10)
## Initialization
1. Installing

 ```npm install```

2. Configuration

 ```sh init.sh```
  - config.yaml
    - URL setting
    - SourceIp setting
  - functions/authorizer/pubkey.pem
    - publickey which is used to decode token
  - functions/authorizer/mobile-pubkey.pem
    - publickey used to verify token from public mobile access

3. DynamoDB Table Data
  - you can add inital data under ```migrations```

## How to run
```sls dynamodb start```
  - Dynamo Local URL: ```http://localhost:8000```

```sls offline```
  - API Gateway Offline URL: ```http://localhost:3000```
  - S3 Bucket Local URL: ```http://localhost:8888```

## Deployment
```sls deploy -s <stage name>```

## Removement
```sls remove -s <stage name>```

## Authors

TODO

## Copyright

© 2017-Present WorksApplications CO.,LTD.

## License

[Apache License 2.0](LICENSE)
