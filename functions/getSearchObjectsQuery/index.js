'use strict';

console.log('Loading function');

const commonModule = require(process.cwd()+'/common');

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  var user = event.requestContext.authorizer;

  var options = event.queryStringParameters || {};

  var isEditFloor = options.all;

  var query = decodeURI(event.pathParameters.query);

  var tenantId = user ? user.tenantId : '';

  if (isEditFloor && user.role == 'guest') {
    commonModule.lambdaUtil(event).send(callback, 401, 'Unauthorized');
    return;
  }

  const db = commonModule.db(event);
  return db.searchObjects(tenantId, options, query).then(results => {
    var data = {};
    data.results = results;
    commonModule.lambdaUtil(event).send(callback, 200, data);
  }).catch((err) => {
    commonModule.lambdaUtil(event).send(callback, 500, err);
  });
};
