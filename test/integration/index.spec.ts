import * as AWS from 'aws-sdk';

const Cfn = new AWS.CloudFormation();

const findPhysicalId = async (stackName: string, logicalId: string) => {
  const resource = (await Cfn.describeStackResource({
    StackName: stackName,
    LogicalResourceId: logicalId
  }).promise()).StackResourceDetail as AWS.CloudFormation.StackResourceDetail;

  return resource.PhysicalResourceId as string;
};

// Find the URL for RestApi endpoint
// This function is designed for the specific stack created by Serverless Framework
const findRestApiInformation = async (stackName: string, region: string) => {
  const restApiId = await findPhysicalId(stackName, 'ApiGatewayRestApi');
  const stageName = await findPhysicalId(stackName, 'ApiGatewayStage');

  return {
    url: `https://${restApiId}.execute-api.${region}.amazonaws.com/${stageName}/`
  };
};

// Find the URL for AppSync endpoint
// This function is designed for the specific stack created by Serverless Framework
const findAppSyncApiEndpointInformation = async (
  stackName: string,
  _region: string
) => {
  // GraphQLApi ARN looks like: arn:aws:appsync:ap-northeast-1:xxxxxxxx:apis/yyyyyyyyyyyyy
  const graphqlApiPhysicalId = await findPhysicalId(stackName, 'GraphQlApi');
  const graphqlApiId = graphqlApiPhysicalId.split('/')[1];

  const AppSync = new AWS.AppSync();
  const graphqlApi = (await AppSync.getGraphqlApi({
    apiId: graphqlApiId
  }).promise()).graphqlApi as AWS.AppSync.GraphqlApi;

  // ApiKey ARN looks like:arn:aws:appsync:ap-northeast-1:xxxxxxxxx:apis/yyyyyyyyyyyyyyy/apikeys/zzzzzzzzzzzzzzzzzzzzzzz
  const apiKeyPhysicalId = await findPhysicalId(
    stackName,
    'GraphQlApiKeyDefault'
  );
  const apiKey = apiKeyPhysicalId.split('/').slice(-1)[0];

  return {
    url: (graphqlApi.uris && graphqlApi.uris['GRAPHQL']) as string,
    apiKey: apiKey
  };
};

const stackName = process.env.STACK_NAME as string;
const region = process.env.REGION || 'ap-northeast-1';

const main = async () => {
  const endpoint = {
    restApi: await findRestApiInformation(stackName, region),
    appsync: await findAppSyncApiEndpointInformation(stackName, region)
  };
};

main();
