'use strict';

console.log('Loading function');

const commonModule = require(process.cwd()+'/common');

const accountServiceStorage = process.env.accountServiceStorage;

const lambdaRole = process.env.lambdaRole;

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  var user = event.requestContext.authorizer;

  var options = event.queryStringParameters || {};

  var isEditFloor = options.all;

  var query = decodeURI(event.pathParameters.query);

  if (isEditFloor && user.role == 'guest') {
    commonModule.lambdaUtil(event).send(callback, 401, 'Unauthorized');
    return;
  }

  const db = commonModule.db(event);
  return commonModule.s3(event).getServiceToken(accountServiceStorage, lambdaRole.split(':')[5] + '/token').then((serviceToken) => {
    return commonModule.profileService(event).search(serviceToken, query).then(people => {
      return db.searchPeopleWithObjects(isEditFloor, people).then((results) => {
        console.log('results: ', JSON.stringify(results));
        var data = {};
        data.results = results;
        console.log('data: ', JSON.stringify(data));
        commonModule.lambdaUtil(event).send(callback, 200, data);
      });
    });
  }).catch((err) => {
    commonModule.lambdaUtil(event).send(callback, 500, err);
  });
};
