const aws = require('aws-sdk');
const appsync = new aws.AppSync();
const s3 = new aws.S3();

const apiName = process.env.appsyncApiName;
const bucketName = process.env.bucketName;
const expirationDays = parseInt(process.env.expirationDays, 10);
const objectPath = process.env.objectPath;

/**
 * About key rotation for AppSync:
 *   AppSync API Key expires at most one year so we need to rotate it.
 *   (When AppSync supports "no auth API (public API)", we don't need the API Key)
 * 
 * About URL:
 * Currently (at 2019-06-28), getApiKey returns the following data:
 * "uris": {
 *   "GRAPHQL": "https://xxxxxxxxxxxx.appsync-api.ap-northeast-1.amazonaws.com/graphql"
 * }
 * 
 * So hopefully we can get the GraphQL API endpoint by picking GRAPHQL key
 */
module.exports.handler = async () => {
  // Hope the number of APIs are small enough
  const apis = await appsync.listGraphqlApis().promise();
  const api = apis.graphqlApis.find(value => value.name == apiName);

  const key = (await appsync.createApiKey({
    apiId: api.apiId,
    expires: (expirationDays * 24 * 60 * 60 + Math.floor(new Date().getTime() / 1000)).toString(),
  }).promise()).apiKey.id;

  await s3.putObject({
    Bucket: bucketName,
    Key: objectPath,
    Body: JSON.stringify({
      key,
      url: api.uris['GRAPHQL'],
    }),
    ContentType: 'application/json'
  }).promise();
};

