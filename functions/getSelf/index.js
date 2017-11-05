'use strict';

console.log('Loading function');

const commonModule = require(process.cwd()+'/common');

var fs = require('fs');

var guest_token = JSON.parse(fs.readFileSync('functions/authorizer/guest_token.json', 'utf8'));


exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

	console.log('guest_token: ', guest_token);

  var user = event.requestContext.authorizer;

  if (user.role == 'guest') commonModule.lambdaUtil(event).send(callback, 200, {});

  commonModule.profileService(event).getPerson(user.token, user.userId).then((person) => {
    if (person == null) {
      var msg = 'Relevant person for ' + user.userId + ' not found.';
      console.log(msg);
      commonModule.lambdaUtil(event).send(callback, 404, msg);
    } else {
      console.log('person: ' + JSON.stringify(person));
      user.person = person;
      commonModule.lambdaUtil(event).send(callback, 200, user);
    }
  }).catch((err) => {
    console.log('err in exports.handler: ' + err);
    commonModule.lambdaUtil(event).send(callback, 500, 'Internal Server Error');
  });
};
