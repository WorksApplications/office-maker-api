var jwt = require('jsonwebtoken');
var fs = require('fs');
var guest_token = JSON.parse(fs.readFileSync('functions/authorizer/guest_token.json', 'utf8'));
var publicKey = fs.readFileSync('functions/authorizer/pubkey.pem');
const yaml = require('js-yaml');

const sourceIp = yaml.safeLoad(fs.readFileSync('sourceIp.yaml', 'utf8'));


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
    '/GET/searchObjects/*',
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
    '/GET/searchObjects/*',
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
  tenantDomain: 'worksap.co.jp',
	token: guest_token.GUEST_TOKEN
};


module.exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  var token = (event.authorizationToken || '').split('Bearer ')[1];
  const allowedGuestResources = getAllowedGuestResource(event.methodArn);
  const allowedGeneralResources = getAllowedGeneralResource(event.methodArn);
  if (!token) {
    callback(null, generate_policy(guest.principalId, 'Allow', allowedGuestResources, guest));
  } else {
    getSelf(token).then(user => {
      if (user.role == 'admin') {
        callback(null, generate_policy(user.userId, 'Allow', event.methodArn, user));
      } else {
        callback(null, generate_policy(user.userId, 'Allow', allowedGeneralResources, user));
      }
    }).catch(message => {
      console.log('msg: ', message);
      callback(null, generate_policy(guest.principalId, 'Allow', allowedGuestResources, guest));
    });
  }
};

function getSelf(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, publicKey, function(e, user) {
      if (e) {
        console.log('error: ' + e);
        reject(e);
      } else {
        user.tenantId = 'worksap.co.jp';
        user.role = user.role.toLowerCase();
        user.token = token;
        resolve(user);
      }
    });
  }).catch(e => {
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
      return Promise.reject('Unauthorized');
    } else {
      return Promise.reject(e.toString());
    }
  });
}

function generate_policy(principal_id, effect, resource, user) {
  return {
    principalId: principal_id,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: effect,
        Condition: {
          IpAddress: sourceIp
        },
        Resource: resource
      }]
    },
    context: user
  };
}
