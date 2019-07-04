import {
  findAppSyncApiEndpointInformation,
  findRestApiInformation,
  readS3Object
} from './aws';
import fs from 'fs';

const stackName = process.env.STACK_NAME as string;
const jwtBucket = process.env.JWT_BUCKET as string;
const jwtKey = process.env.JWT_KEY as string;

const main = async () => {
  const endpoint = {
    restApi: await findRestApiInformation(stackName),
    appsync: await findAppSyncApiEndpointInformation(stackName),
    systemJWT: JSON.parse(await readS3Object(jwtBucket, jwtKey)).accessToken
  };

  fs.writeFileSync('endpoint.json', JSON.stringify(endpoint));
};

main();
