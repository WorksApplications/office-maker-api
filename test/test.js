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
      query () {
        return {
          promise: () => {}
        };
      }
    };

    lambda = proxyquire(process.cwd() + '/functions/getColors/index', {
      '../../common': {
        'db' : proxyquire(process.cwd() + '/common/db', {
          'aws-sdk': {
            DynamoDB: {
              DocumentClient: proxyDynamoDB
            }
          }
        })
      }
    });
  });

  describe('getColors Lambda', () => {
    event = {
      requestContext: {
        authorizer: {
          tenantId: 'worksap.co.jp'
        }
      }
    };
    it('Should return result when running successfully', () => {
      dynamoDbGetStub = sinon.stub(proxyDynamoDB.prototype, 'query')
      .callsArgWith(1, '', {
        Items: {
          tenantId: 'worksap.co.jp',
          id: 0
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
          body: JSON.stringify({
            tenantId: 'worksap.co.jp',
            id: 0
          })
        });
      });
    });

    it('Should return result when running successfully', () => {
      dynamoDbGetStub = sinon.stub(proxyDynamoDB.prototype, 'query')
      .callsArgWith(1, 'err', {});
      return LambdaTester( lambda.handler )
      .event(event)
      .expectResult((result) => {
        expect(result).to.deep.equal({
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify('err')
        });
      });
    });
  });
});
