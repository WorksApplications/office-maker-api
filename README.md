# office-maker-api
## Getting Started
[Node.js](https://nodejs.org/) (>= 6.10)
## Initialization
1. Installing

 ```npm install```

2. Configuration

 ```sh init.sh```
  - sourceIp.yaml
    - ip address which you allow to access
  - functions/authorizer/pubkey.pem
    - publickey which is used to decode token
  - functions/authorizer/guest_token.json
    - special token for guest user
  - ProfileServiceRoot
    - URL for ProfileServiceRoot
    
3. DynamoDB Table Data
  - you can add inital data under ```migrations```

## How to run
```sls dynamodb start```
  - Dynamo Local URL: ```http://localhost:8000```

```sls offline```
  - API Gateway Offline URL: ```http://localhost:3000```
  - S3 Bucket Local URL: ```http://localhost:8888```

## Deployment
```sls deploy -v```

## Removement
```sls remove -v```


## Build

TODO

## Debug

TODO

## Contributing

TODO

## Versioning

TODO

## Authors

TODO

## Acknowledgments

TODO

## Copyright

© 2017-Present WorksApplications CO.,LTD.

## License

[Apache License 2.0](LICENSE)
