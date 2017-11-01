'use strict';

console.log('Loading function');

const AWS = require('aws-sdk');

const s3 = new AWS.S3({});

const commonModule = require('common');

const storageName = process.env.storageName;

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  var id = event.pathParameters.imageId;

  var body = new Buffer(event.body,'base64');

  var type = event.headers['content-type'];

  putImage(id, body, type).then((data) => {
    commonModule.lambdaUtil(event).send(callback, 200, data);
  }).catch((err) => {
    commonModule.lambdaUtil(event).send(callback, 500, err);
  });
};

function putImage(id, body, type){
  return new Promise((resolve, reject) => {
    var params = {
      Body: body,
      ContentType: type,
      Bucket: storageName,
      Key: 'images/floors/'+id
    };
    console.log('params: '+JSON.stringify(params));
    return s3.putObject(params, function(err, data) {
      if (err) {
        console.log('err: '+err);
        return reject(err);
      }
      else {
        console.log('data: '+data);
        return resolve(data);
      }
    });
  });
}
