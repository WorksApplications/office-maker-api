const AWS = require('aws-sdk');

function getS3(event) {
  var S3 = null;
  if ('isOffline' in event && event.isOffline) {
    S3 = new AWS.S3({
      s3ForcePathStyle: true,
      endpoint: new AWS.Endpoint('http://localhost:8888'),
    });
  } else {
    S3 = new AWS.S3({
      apiVersion: '2006-03-01'
    });
  }
  return S3;
}

function create(event) {
  console.log('event', event);
  const s3 = getS3(event);

  function putImage(id, body, type, storageBucketName){
    return new Promise((resolve, reject) => {
      var params = {
        Body: body,
        ContentType: type,
        Bucket: storageBucketName,
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

  function putFloorsInfo(binary, storageBucketName, floorId) {
    return new Promise((resolve, reject) => {
      var params = {
        Body: binary,
        Bucket: storageBucketName,
        Key: 'files/floors/' + floorId,
        ContentType: 'application/json',
        ContentEncoding: 'gzip',
        CacheControl: 'max-age=0'
      };
      console.log('params: ' + JSON.stringify(params));
      s3.putObject(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          console.log('data: ' + JSON.stringify(data));
          resolve(data);
        }
      });
    });
  }

  function deleteObject(storageBucketName, floorId){
    return new Promise((resolve, reject) => {
      var params = {
        Bucket: storageBucketName,
        Key: 'files/floors/' + floorId
      };
      console.log('params: ' + JSON.stringify(params));
      s3.deleteObject(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          console.log('success: ' + JSON.stringify(data));
          resolve(data);
        }
      });
    });
  }

  function listImages(storageBucketName) {
    return new Promise((resolve, reject) => {
      var params = {
        Bucket: storageBucketName,
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

  function deleteImage(storageBucketName, imageId) {
    console.log('deleteImage');
    return new Promise((resolve, reject) => {
      var params = {
        Bucket: storageBucketName,
        Key: 'images/floors/' + imageId
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


  return {
    putImage: putImage,
    putFloorsInfo: putFloorsInfo,
    deleteObject: deleteObject,
    deleteImage: deleteImage,
    listImages: listImages
  };
}

module.exports = create;
