'use strict';
const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
chai.use(require('chai-as-promised'));
const expect = require('chai').expect;
require('dotenv').config({path: 'test/environments/.env'});

describe('office-maker-api Lambda', () => {
  let event;
  let callback;
  let context;
  let lambda;
  let proxyDynamoDB;
  let dynamoDbGetStub;

  beforeEach(() => {
    proxyDynamoDB = class {
      query (params) {
        return {
          promise: () => {}
        };
      }
    };
    event = {
      requestContext: {
        authorizer: {
          tenantId: 'worksap.co.jp'
        }
      },
      isTest: true
    };
    callback = (error, result) => {
      return new Promise((resolve, reject) => {
        error ? reject(error) : resolve(result);
      });
    };
    context = {};

    lambda = proxyquire(process.cwd() + '/functions/getColors/index', {
      'aws-sdk': {
        DynamoDB: {
          DocumentClient: proxyDynamoDB
        }
      }
    });
  });

  it('Should return resolve when running successfully', () => {
    dynamoDbGetStub = sinon.stub(proxyDynamoDB.prototype, 'query')
    .returns({promise: () => {
      return Promise.resolve({
        Item: {
          post_title: 'aa',
          post_content: 'bb'
        }
      });
    }});
    var result = lambda.handler(event, context, callback);
    console.log('dynamoDbGetStub.calledOnce: ', dynamoDbGetStub.calledOnce);
    expect(dynamoDbGetStub.calledOnce).to.be.equal(true);
    expect(result).to.deep.equal(JSON.stringify({
      statusCode: 200,
      body: {post_title: 'aa', post_content: 'bb'}
    }));
    // return expect(lambda.handler(event, context, callback)).to.be.fulfilled.then(result => {
    //   expect(dynamoDbGetStub.calledOnce).to.be.equal(true);
    //   expect(result).to.deep.equal(JSON.stringify({
    //     statusCode: 200,
    //     body: {post_title: 'aa', post_content: 'bb'}
    //   }));
    // });
  });
});
