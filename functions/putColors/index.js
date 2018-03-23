'use strict';

console.log('Loading function');

const commonModule = require('../../common');

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  var user = event.requestContext.authorizer;

  var colors = JSON.parse(event.body);

  if (!colors || !colors.length) {
    commonModule.lambdaUtil(event).send(callback, 403, 'Forbiden');
  }

  colors = colors.map((c, index) => {
    c.id = index + '';
    return c;
  });

  const db = commonModule.db(event);
  db.saveColors(user.tenantId, colors).then((data) => {
    commonModule.lambdaUtil(event).send(callback, 200, data);
  }).catch((err) => {
    commonModule.lambdaUtil(event).send(callback, 500, err);
  });
};
