var expect = require('chai').expect;
var proxyquire = require('proxyquire');

describe('getSelf', () => {
  let getSelf;

  describe('When the user found', () => {
    beforeEach(() => {
      process.env.lambdaRole = 'test1:test2:test3:test4:test5:test6';

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

    it('should respond 200', () => {
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
  });
});

