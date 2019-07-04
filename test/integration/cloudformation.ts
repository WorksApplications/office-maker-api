import * as AWS from 'aws-sdk';

const region = process.env.REGION || 'ap-northeast-1';
AWS.config.update({
  region
});

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
export const findRestApiInformation = async (stackName: string) => {
  const restApiId = await findPhysicalId(stackName, 'ApiGatewayRestApi');
  const stageName = await findPhysicalId(stackName, 'ApiGatewayStage');

  return {
    url: `https://${restApiId}.execute-api.${region}.amazonaws.com/${stageName}`
  };
};

// Find the URL for AppSync endpoint
// This function is designed for the specific stack created by Serverless Framework
export const findAppSyncApiEndpointInformation = async (stackName: string) => {
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
