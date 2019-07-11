const commonModule = require('../../common');

module.exports.handler = async event => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  // in db.js, event (argument) is only used for checking offline or not.
  const db = commonModule.db({});

  const objects = await db.saveObjectsChange(event.arguments.objects);

  return {
    objects,
    updatedFloorId: objects.length > 0 ? objects[0].object.floorId : ''
  };
};
