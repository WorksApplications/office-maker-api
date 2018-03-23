'use strict';

console.log('Loading function');

const commonModule = require('../../common');

const STORAGE_NAME = process.env.STORAGE_NAME;

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  var id = event.pathParameters.imageId;

  var body = Buffer.from(event.body.replace(/^data:image\/\w+;base64,/, ''),'base64');

  const s3 = commonModule.s3(event);

  console.log('body: ', body);

  var type = event.headers['content-type'];

  s3.putImage(id, body, type, STORAGE_NAME).then((data) => {
    commonModule.lambdaUtil(event).send(callback, 200, data);
  }).catch((err) => {
    commonModule.lambdaUtil(event).send(callback, 500, err);
  });
};
