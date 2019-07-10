const commonModule = require('../../common');

module.exports.handler = async event => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  // in db.js, event (argument) is only used for checking offline or not.
  const db = commonModule.db({});

  return await db.saveObjectsChange(event.arguments.objects);
};
