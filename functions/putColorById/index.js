'use strict';

console.log('Loading function');

const commonModule = require(process.cwd()+'/common');

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  var user = event.requestContext.authorizer;

  var id = event.pathParameters.id;

  var color = JSON.parse(event.body);

  color.id = id;

  if (!color) {
    commonModule.lambdaUtil(event).send(callback, 403, 'Forbiden');
  }

  const db = commonModule.db(event);
  db.putColor(user.tenantId, color).then((data) => {
    commonModule.lambdaUtil(event).send(callback, 200, data);
  }).catch((err) => {
    commonModule.lambdaUtil(event).send(callback, 500, err);
  });
};
