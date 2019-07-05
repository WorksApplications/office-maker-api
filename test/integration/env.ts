import fs from 'fs';
import * as AWS from 'aws-sdk';

const outputs: {
  OutputKey: string;
  OutputValue: string;
  Description: string;
}[] = JSON.parse(process.env.OUTPUT);
const jwtBucket = process.env.JWT_BUCKET;
const jwtKey = process.env.JWT_KEY;
const region = process.env.REGION || 'ap-northeast-1';

AWS.config.update({
  region
});

const S3 = new AWS.S3();

export const readS3Object = async (bucket: string, key: string) => {
  const result = await S3.getObject({
    Bucket: bucket,
    Key: key
  }).promise();

  return result.Body as string;
};

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
