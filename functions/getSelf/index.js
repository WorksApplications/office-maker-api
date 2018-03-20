'use strict';

console.log('Loading function');

const commonModule = require(process.cwd()+'/common');

const accountServiceStorage = process.env.accountServiceStorage;

const lambdaRole = process.env.lambdaRole;


exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  var user = event.requestContext.authorizer;

  if (user.role == 'guest') commonModule.lambdaUtil(event).send(callback, 200, {});

  return commonModule.s3(event).getServiceToken(accountServiceStorage, lambdaRole.split(':')[5] + '/token').then((serviceToken) => {
    commonModule.profileService(event).getPerson(serviceToken, user.userId).then((person) => {
      if (person == null) {
        var msg = 'Relevant person for ' + user.userId + ' not found.';
        console.log(msg);
        commonModule.lambdaUtil(event).send(callback, 404, msg);
      } else {
        console.log('person: ' + JSON.stringify(person));
        user.person = person;
        commonModule.lambdaUtil(event).send(callback, 200, user);
      }
    });
  }).catch((err) => {
    console.log('err in exports.handler: ' + err);
    commonModule.lambdaUtil(event).send(callback, 500, 'Internal Server Error');
  });
};
