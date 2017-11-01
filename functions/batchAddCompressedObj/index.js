'use strict';

console.log('Loading function');

const commonModule = require('common');

const aws = require('aws-sdk');

const s3 = new aws.S3({
  apiVersion: '2006-03-01'
});

const zlib = require('zlib');


const storageBucketName = process.env.STORAGE_NAME;
if (!storageBucketName && storageBucketName !== '') {
  throw 'process.env.STORAGE_NAME not found.';
}


exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log('Received context:', JSON.stringify(context, null, 2));

  var tenantId = 'worksap.co.jp';

  var isEditFloor = false;

  event.Records.forEach((record) => {
    console.log('Stream record: ', JSON.stringify(record, null, 2));

    var floorId = record.dynamodb.Keys.id.S;

    const db = commonModule.db(event);
    return db.getFloorWithObjects(tenantId, floorId, isEditFloor).then((data) => {
      console.log('data: ', JSON.stringify(data));
      return zlib.gzip(JSON.stringify(data), function(err, binary) {
        var params = {
          Body: binary,
          Bucket: storageBucketName,
          Key: 'files/floors/' + floorId,
          ContentType: 'application/json',
          ContentEncoding: 'gzip',
          CacheControl: 'max-age=0'
        };
        return s3.putObject(params).promise().then(() => {
          commonModule.lambdaUtil(event).send(callback, 200, 'success');
        });
      });
    }).catch((err) => {
      console.log('err in exports.handler: ', err);
      commonModule.lambdaUtil(event).send(callback, 500, err);
    });
  });
};
