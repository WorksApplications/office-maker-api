'use strict';

console.log('Loading function');

const commonModule = require(process.cwd()+'/common');


exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const db = commonModule.db(event);
  const s3 = commonModule.s3(event);

  return db.getAllImageIds((floorImageIds) => {
    return s3.listImages().then((data) => {
      data.Contents.forEach((object) => {
        var imageId = object.Key.split('images/floors/')[1];
        if(floorImageIds.indexOf(imageId) == -1) {
          s3.deleteImage(imageId);
        }
      });
      return Promise.resolve();
    });
  }).then((data) => {
    commonModule.lambdaUtil(event).send(callback, 200, data);
  }).catch((err) => {
    commonModule.lambdaUtil(event).send(callback, 500, err);
  });
};
