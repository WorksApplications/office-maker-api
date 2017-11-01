'use strict';

console.log('Loading function');

const commonModule = require('common');

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const s3 = new AWS.S3({
  apiVersion: '2006-03-01'
});

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const db = commonModule.db(event);
  const tableNames = commonModule.tableNames(context);

  return getAllFloors(tableNames.editFloors).then((editFloors) => {
    return getAllFloors(tableNames.publicFloors).then((publicFloors) => {
      var floors = editFloors.concat(publicFloors);
      var floorImageIds = [];
      floors.forEach((floor) => {
        if (!IsArrayExists(floorImageIds, floor.image)) {
          floorImageIds.push(floor.image);
        }
      });
      return getImage().then((data) => {
        data.Contents.forEach((object) => {
          var imageId = object.Key.split('images/floors/')[1];
          if (floorImageIds.indexOf(imageId) == -1) {
            deleteImage(imageId);
          }
        });
        return Promise.resolve();
      }).then((data) => {
        commonModule.lambdaUtil(event).send(callback, 200, data);
      }).catch((err) => {
        commonModule.lambdaUtil(event).send(callback, 500, err);
      });
    });
  });
};

function getImage() {
  return new Promise((resolve, reject) => {
    var params = {
      Bucket: 'office-maker',
      Prefix: 'images/floors/'
    };
    return s3.listObjects(params, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function deleteImage(id) {
  console.log('deleteImage');
  return new Promise((resolve, reject) => {
    var params = {
      Bucket: 'office-maker',
      Key: 'images/floors/' + id
    };
    console.log('params' + JSON.stringify(params));
    return s3.deleteObject(params, function(err, data) {
      if (err) {
        console.log('err in deleteImage: ' + err);
        reject(err); // an error occurred
      } else {
        console.log('success: ' + JSON.stringify(data));
        resolve(data); // successful response
      }
    });
  });
}


function getAllFloors(table_name) {
  return new Promise(function(resolve, reject) {
    return dynamo.scan({
      TableName: table_name
    }, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data.Items);
      }
    });
  });
}

function IsArrayExists(array, value) {
  // 配列の最後までループ
  for (var i = 0, len = array.length; i < len; i++) {
    if (value == array[i]) {
      // 存在したらtrueを返す
      return true;
    }
  }
  // 存在しない場合falseを返す
  return false;
}
