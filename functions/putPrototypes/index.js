'use strict';

console.log('Loading function');

const commonModule = require(process.cwd()+'/common');

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  var user = event.requestContext.authorizer;

  var prototypes = JSON.parse(event.body);
  if (!prototypes || !prototypes.length) {
    commonModule.lambdaUtil(event).send(callback, 403, 'Forbiden');
  }

  const db = commonModule.db(event);
  db.putPrototypes(user.tenantId, prototypes).then((data) => {
    commonModule.lambdaUtil(event).send(callback, 200, data);
  }).catch((err) => {
    commonModule.lambdaUtil(event).send(callback, 500, err);
  });
};
