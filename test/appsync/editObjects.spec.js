const expect = require('chai').expect;
const axios = require('axios').default;
const awsconfig = require('../../src/aws-exports').default;
const { AUTH_TYPE } = require('aws-appsync');
const AWSAppSyncClient = require('aws-appsync').default;

/*
const queries = require('../../src/graphql/queries');

const client = new AWSAppSyncClient({
  url: awsconfig.aws_appsync_graphqlEndpoint,
  region: awsconfig.aws_appsync_region,
  auth: {
    type: AUTH_TYPE.API_KEY,
    apiKey: awsconfig.aws_appsync_apiKey
  },
  disableOffline: true
});
*/
describe('EditObjects', () => {
  it('aaa', () => {
    expect(1).eq(2);
  });
});
