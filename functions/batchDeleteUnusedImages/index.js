'use strict';

console.log('Loading function');

const commonModule = require('../../common');

const storageBucketName = process.env.STORAGE_NAME;

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const db = commonModule.db(event);
  const s3 = commonModule.s3(event);

  return db.getAllImageIds().then((floorImageIds) => {
    return s3.listImages(storageBucketName).then((data) => {
      data.Contents.forEach((object) => {
        var imageId = object.Key.split('images/floors/')[1];
        if(floorImageIds.indexOf(imageId) == -1) {
          s3.deleteImage(storageBucketName, imageId);
        }
      });
      return Promise.resolve('success');
    });
  }).then((data) => {
    commonModule.lambdaUtil(event).send(callback, 200, data);
  }).catch((err) => {
    commonModule.lambdaUtil(event).send(callback, 500, err);
  });
};
