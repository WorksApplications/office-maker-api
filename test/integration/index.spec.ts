import {
  findAppSyncApiEndpointInformation,
  findRestApiInformation
} from './cloudformation';
import fs from 'fs';

const stackName = process.env.STACK_NAME as string;

const main = async () => {
  const endpoint = {
    restApi: await findRestApiInformation(stackName),
    appsync: await findAppSyncApiEndpointInformation(stackName)
  };

  fs.writeFileSync('endpoint.json', JSON.stringify(endpoint));
};

main();
