'use strict';

console.log('Loading function');

const commonModule = require(process.cwd()+'/common');

const zlib = require('zlib');


const storageBucketName = process.env.STORAGE_NAME;
if (!storageBucketName && storageBucketName !== '') {
  throw 'process.env.STORAGE_NAME not found.';
}


exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log('Received context:', JSON.stringify(context, null, 2));


  var isEditFloor = false;

  event.Records.forEach((record) => {
    console.log('Stream record: ', JSON.stringify(record, null, 2));

    var tenantId = record.dynamodb.Keys.tenantId.S;
    var floorId = record.dynamodb.Keys.id.S;

    const db = commonModule.db(event);
    const s3 = commonModule.s3(event);
    if(record.eventName == 'REMOVE'){
      return s3.deleteObject(storageBucketName, floorId).then((data) => {
        console.log('data: ', JSON.stringify(data));
        commonModule.lambdaUtil(event).send(callback, 200, 'success');
      }).catch((err) => {
        console.log('err in exports.handler: ', err);
        commonModule.lambdaUtil(event).send(callback, 500, err);
      });
    }else{
      return db.getFloorWithObjects(tenantId, floorId, isEditFloor).then((data) => {
        console.log('data: ', JSON.stringify(data));
        return zlib.gzip(JSON.stringify(data), function(err, binary) {
          return s3.putFloorsInfo(binary, storageBucketName, floorId).then(() => {
            commonModule.lambdaUtil(event).send(callback, 200, 'success');
          });
        });
      }).catch((err) => {
        console.log('err in exports.handler: ', err);
        commonModule.lambdaUtil(event).send(callback, 500, err);
      });
    }
  });
};
