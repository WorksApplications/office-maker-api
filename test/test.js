'use strict';

var expect = require( 'chai' ).expect;
const sinon = require('sinon');
var LambdaTester = require( 'lambda-tester' );
const proxyquire = require('proxyquire');
require('dotenv').config({path: 'test/environments/.env'});

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

    event = {
      requestContext: {
        authorizer: {
          tenantId: 'worksap.co.jp'
        }
      }
    };

    db = proxyquire(process.cwd() + '/common/db', {
      'aws-sdk': {
        DynamoDB: {
          DocumentClient: proxyDynamoDB
        }
      }
    });
    common = proxyquire(process.cwd() +'/functions/getColors/index', {
      './db.js': db
    });
    lambda = proxyquire(process.cwd() + '/functions/getColors/index', {
      '../../common': common
    });
  });

  it('Should return result when running successfully', () => {
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
      console.log('result: ', result);
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
