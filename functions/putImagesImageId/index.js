'use strict';

console.log('Loading function');

const AWS = require('aws-sdk');

const s3 = new AWS.S3({});

const commonModule = require('common');

const STORAGE_NAME = process.env.STORAGE_NAME;

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  var id = event.pathParameters.imageId;


  var body = Buffer.from(event.body.replace(/^data:image\/\w+;base64,/, ''),'base64');

  console.log('body: ', body);

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
      Bucket: STORAGE_NAME,
      Key: 'images/floors/'+id
    };
    console.log('params: '+JSON.stringify(params));
    return s3.putObject(params, function(err, data) {
      if (err) {
        console.log('err: '+err);
        return reject(err);
      }
      else {
        console.log('data: '+JSON.stringify(data, null, 2));
        return resolve(data);
      }
    });
  });
}
