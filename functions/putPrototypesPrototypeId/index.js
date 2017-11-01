'use strict';

console.log('Loading function');

const commonModule = require('common');

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  var user = event.requestContext.authorizer;

  var prototype = JSON.parse(event.body);

  if (!prototype) {
    commonModule.lambdaUtil(event).send(callback, 403, 'Forbiden');
  }

  const db = commonModule.db(event);
  db.putPrototype(user.tenantId, prototype).then((data) => {
    commonModule.lambdaUtil(event).send(callback, 200, data);
  }).catch((err) => {
    commonModule.lambdaUtil(event).send(callback, 500, err);
  });
};
