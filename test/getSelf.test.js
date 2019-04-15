var expect = require('chai').expect;
var proxyquire = require('proxyquire');

describe('getSelf', () => {
  let getSelf;

  describe('When the user found', () => {
    beforeEach(() => {
      process.env.lambdaRole = 'arn:aws:iam::111111111111:role/lambda-role';

      getSelf = proxyquire(process.cwd() + '/functions/getSelf/index', {
        '../../common': {
          s3: () => ({
            getServiceToken: (bucketName, key) => {
              return new Promise((resolve, reject) => {
                resolve('test-token');
              });
            },
          }),
          profileService: proxyquire(process.cwd() + '/common/profile-service', {
            'request': (options, callback) => {
              var response = {
                statusCode: 200,
              };

              callback(null, response, JSON.stringify({
                "employeeId": "00001",
                "post": "Baz",
                "organization": "Example Organization",
                "userId": "foobar@example.com",
                "ruby": "foo bar",
                "extensionPhone": "1111",
                "mail": "foobar@example.com",
                "picture": "file://picture.png",
                "name": "foo bar",
              }));
            },
          }),
        }
      });
    });

    it('should respond 200 to a request from an admin', () => {
      getSelf.handler({
        requestContext: {
          authorizer: {
            role: 'admin'
          }
        },
        stageVariables: {
          ProfileServiceRoot: 'hoge',
        },
      }, {}, (err, response) => {
        expect(err).to.equal(null);
        expect(response.statusCode).to.equal(200);
      });
    });

    it('should respond 200 to a request from a guest', () => {
      getSelf.handler({
        requestContext: {
          authorizer: {
            role: 'guest'
          }
        },
        stageVariables: {
          ProfileServiceRoot: 'hoge',
        },
      }, {}, (err, response) => {
        expect(err).to.equal(null);
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});

