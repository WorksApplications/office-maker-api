'use strict';

console.log('Loading function');

const commonModule = require(process.cwd()+'/common');

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  var user = event.requestContext.authorizer;

  var options = event.queryStringParameters;

  var isEditFloor = true;

  if (options.ids) {
    var ids = options.ids.split(',');
    return commonModule.profileService(event).getPeopleByIds(null, ids);
  }
  var floorId = options.floorId;
  // var floorVersion = options.floorVersion;
  var postName = (options.post);
  if (!floorId || !postName) {
    commonModule.lambdaUtil(event).send(callback, 400, '');
  }

  const db = commonModule.db(event);
  db.getFloorWithObjects(user.tenantId, floorId, isEditFloor).then((floor) => {
    var peopleSet = {};
    floor.objects.forEach((object) => {
      if (object.personId) {
        peopleSet[object.personId] = true;
      }
    });
    return commonModule.profileService(event).getPeopleByPost(user.token, postName).then((people) => {
      console.log('people: ', JSON.stringify(people));
      Promise.resolve(people.filter((person) => {
        console.log('person: ', JSON.stringify(person));
        return peopleSet[person.id];
      })).then((data) => {
        return commonModule.lambdaUtil(event).send(callback, 200, data);
      });
    });
  }).catch((err) => {
    commonModule.lambdaUtil(event).send(callback, 500, err);
  });
};
