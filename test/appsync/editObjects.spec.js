import AWSAppSyncClient, { AUTH_TYPE, createAppSyncLink } from 'aws-appsync';
import fetch from 'node-fetch';
import gql from 'graphql-tag';
import { createHttpLink } from 'apollo-link-http';
import { expect } from 'chai';
const aws_config = require('../../src/aws-exports').default;
const queries = require('../../src/graphql/queries');
const mutations = require('../../src/graphql/mutations');

const link = createHttpLink({ uri: '/graphql', fetch: fetch });

const AppSyncConfig = {
  url: aws_config.aws_appsync_graphqlEndpoint,
  region: aws_config.aws_appsync_region,
  auth: {
    type: AUTH_TYPE.API_KEY,
    apiKey: aws_config.aws_appsync_apiKey,
  },
  disableOffline: true,
};

const client = new AWSAppSyncClient(AppSyncConfig, {
  link: createAppSyncLink({
    ...AppSyncConfig,
    resultsFetcherLink: link,
  })
});

// This test is not working now. Put ApiKey on the header.
describe('EditObjects', () => {
  it('should add an edit object', async () => {
    const result = await client.mutate({
      mutation: gql(mutations.addEditObject),
      variables: {
        floorId: 'test',
      }
    });

    console.log(JSON.stringify(result));
  });
});
