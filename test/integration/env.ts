import { readS3Object } from './aws';
import fs from 'fs';

const outputs: {
  OutputKey: string;
  OutputValue: string;
  Description: string;
}[] = JSON.parse(process.env.OUTPUT);
const jwtBucket = process.env.JWT_BUCKET;
const jwtKey = process.env.JWT_KEY;

const main = async () => {
  const endpoint = {
    restApi: {
      url: outputs.find(output => output.OutputKey == 'ServiceEndpoint')
        .OutputValue
    },
    appsync: {
      url: outputs.find(output => output.OutputKey == 'GraphQlApiUrl')
        .OutputValue,
      apiKey: outputs.find(output => output.OutputKey == 'GraphQlApiKeyDefault')
        .OutputValue
    },
    systemJWT: JSON.parse(await readS3Object(jwtBucket, jwtKey)).accessToken
  };

  fs.writeFileSync('endpoint.json', JSON.stringify(endpoint));
};

main();
