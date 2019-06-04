var fs = require('fs');
const yaml = require('js-yaml');

const sourceIp = yaml.safeLoad(fs.readFileSync('config.yml', 'utf8')).sourceIp;

function getResourceRoot(methodArn) {
  return methodArn
    .split('/GET/')[0]
    .split('/POST/')[0]
    .split('/PUT/')[0]
    .split('/PATCH/')[0]
    .split('/DELETE/')[0];
}

function getAllowedGuestResource(methodArn) {
  const resourceRoot = getResourceRoot(methodArn);
  return [
    '/GET/self',
    '/GET/floors',
    '/GET/floors/*/public',
    '/GET/images/*',
    '/GET/people/*',
    '/GET/objects/*',
    '/GET/search/*',
    '/GET/searchObjects/*'
  ].map(r => {
    return resourceRoot + r;
  });
}

function getAllowedGeneralResource(methodArn) {
  const resourceRoot = getResourceRoot(methodArn);
  return [
    '/GET/self',
    '/GET/floors',
    '/GET/floors/*/public',
    '/GET/images/*',
    '/GET/people/*',
    '/GET/objects/*',
    '/PATCH/objects/*',
    '/GET/search/*',
    '/GET/searchObjects/*'
  ].map(r => {
    return resourceRoot + r;
  });
}

const guest = {
  role: 'guest',
  tenantId: 'worksap.co.jp',
  principalId: 'office-maker@worksap.co.jp',
  exp: '',
  userId: 'office-maker@worksap.co.jp',
  tenantDomain: 'worksap.co.jp'
  // token: guest_token
};

/*
  Header: { Authorization: 'Bearer ${token-type}' }

  token-type:
  - guest: leave empty for guest
  - user/admin: put base64 encoded user json string
*/
module.exports.handler = (event, context, callback) => {
  var token = (event.authorizationToken || '').split('Bearer ')[1];
  const allowedGuestResources = getAllowedGuestResource(event.methodArn);
  const allowedGeneralResources = getAllowedGeneralResource(event.methodArn);

  if (!token) {
    callback(
      null,
      generate_policy(guest.principalId, 'Allow', allowedGuestResources, guest)
    );
  } else {
    const user = JSON.parse(new Buffer(token, 'base64').toString('ascii'));

    if (user.role == 'admin') {
      callback(
        null,
        generate_policy(user.userId, 'Allow', event.methodArn, user)
      );
    } else {
      callback(
        null,
        generate_policy(user.userId, 'Allow', allowedGeneralResources, user)
      );
    }
  }
};

function generate_policy(principal_id, effect, resource, user) {
  return {
    principalId: principal_id,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Condition: {
            IpAddress: sourceIp
          },
          Resource: resource
        }
      ]
    },
    context: user
  };
}
