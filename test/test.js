'use strict';
process.env.TABLE_PREFIX = 'office-maker-map-stg';
var expect = require( 'chai' ).expect;
const sinon = require('sinon');
var LambdaTester = require( 'lambda-tester' );
const proxyquire = require('proxyquire');
// require('dotenv').config({path: 'test/.env'});

describe('office-maker-api Lambda', () => {
  let event;
  let db;
  let common;
  let lambda;
  let proxyDynamoDB;
  let dynamoDbGetStub;

  beforeEach(() => {
    proxyDynamoDB = class {
      query (params, func) {}
    };

    db = proxyquire(process.cwd() + '/common/db', {
      'aws-sdk': {
        DynamoDB: {
          DocumentClient: proxyDynamoDB
        }
      }
    });
    lambda = proxyquire(process.cwd() + '/functions/getColors/index', {
      '../../common': {
        './db.js': db
      }
    });
  });

  it('Should return result when running successfully', () => {
    event = {
      requestContext: {
        authorizer: {
          tenantId: 'worksap.co.jp'
        }
      }
    };
    dynamoDbGetStub = sinon.stub(proxyDynamoDB.prototype, 'query')
    .callsArgWith(1, '', {
      Items: {
        post_title: 'aa',
        post_content: 'bb'
      }
    });
    return LambdaTester( lambda.handler )
    .event(event)
    .expectResult((result) => {
      expect(result).to.deep.equal({
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({post_title: 'aa', post_content: 'bb'})
      });
    });
  });
});
