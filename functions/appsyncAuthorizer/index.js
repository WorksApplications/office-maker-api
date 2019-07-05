const jwt = require('jsonwebtoken');
const fs = require('fs');
const yaml = require('js-yaml');

const tenantId = process.env.tenantId;
const publicKey = process.env.publicKey;

// We read from config.yml, which is ugly, since we cannot simply set a list into Lambda environment variables.
const sourceIpList = yaml.safeLoad(fs.readFileSync('config.yml', 'utf8')).sourceIp['aws:SourceIp'];

// I want to separate the "generating the result" part and "checking permission" part.
module.exports.handler = async (event) => {
  const headers = event.request.headers;
  const user = await getSelf(token);

  // Skip IP check if the user has SYSTEM role
  if (user.role !== 'system') {
    // Header does not include sourceIp?
    // I assume that the first address is what we want
    const ipAddress = headers['x-forwarded-for'].split(',')[0];
    const token = headers['authorization'].split('Bearer ')[1];

    // Current sourceIpList consists of CIDR blocks; 0.0.0.0/32
    if (!sourceIpList.map(val => val.split('/32')[0]).includes(ipAddress)) {
      throw new Error('Unauthorized by SourceIp');
    }
  }

  return user;
};

// Take from authorizer
function getSelf(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, publicKey, function(e, user) {
      if (e) {
        console.log('error: ' + e);
        reject(e);
      } else {
        user.tenantId = tenantId;
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
