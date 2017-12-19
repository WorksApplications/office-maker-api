const AWS = require('aws-sdk');

function getDynamoDC(event) {
  var dynamodb = null;
  if ('isOffline' in event && event.isOffline) {
    dynamodb = new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
      maxRetries: 1
    });
  } else if ('isTest' in event && event.isTest) {
    dynamodb = new AWS.DynamoDB.DocumentClient({});
  } else {
    dynamodb = new AWS.DynamoDB.DocumentClient({
      maxRetries: 1
    });
  }
  return dynamodb;
}


const getTableNames = require('./table-names.js');

function create(event) {
  console.log('event', event);
  const client = getDynamoDC(event);
  const tableNames = getTableNames(event);

  function publishFloor(tenantId, floorId, updateBy, updateAt) {
    return getChangedObjects(floorId, tableNames.editObjects).then((changedObjects) => {
      console.log('done getChangedObjects');
      return reflectChangedObjects(changedObjects).then(() => {
        console.log('done reflectChangedObjects');
        return getFloor(tenantId, floorId, tableNames.editFloors).then((floor) => {
          console.log('done getFloor');
          floor.updateBy = updateBy;
          floor.updateAt = updateAt;
          return putFloor(floor, tableNames.publicFloors).then(() => {
            console.log('done putFloor');
            return getObjects(floorId, tableNames.editObjects).then((newObjects) => {
              console.log('done getObjects');
              floor.objects = newObjects;
              return Promise.resolve(floor);
            });
          });
        });
      });
    });
  }

  function updateChangedObject(floorId, objectId, table_name) {
    return new Promise((resolve, reject) => {

      var params = {
        TableName: table_name,
        Key: {
          'floorId': floorId,
          'id': objectId
        },
        UpdateExpression: 'SET #changed = :changed',
        ExpressionAttributeNames: {
          '#changed': 'changed'
        },
        ExpressionAttributeValues: {
          ':changed': false
        },
      };
      console.log('params: ' + JSON.stringify(params));
      client.update(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }


  function saveEditingFloor(tenantId, newFloor) {
    newFloor.tenantId = tenantId;
    return putFloor(newFloor, tableNames.editFloors).then(() => {
      return Promise.resolve(newFloor);
    }).catch((err) => {
      return Promise.reject(err);
    });
  }

  function getFloorWithObjects(tenantId, id, isEditFloor) {
    var floorTableName = isEditFloor ? tableNames.editFloors : tableNames.publicFloors;
    return getFloor(tenantId, id, floorTableName).then((floor) => {
      if (!floor) return Promise.reject('Not Found');
      var objectTableName = isEditFloor ? tableNames.editObjects : tableNames.publicObjects;
      return getObjects(id, objectTableName).then((objects) => {
        console.log('objects: ', JSON.stringify(objects));
        floor.objects = objects;
        return Promise.resolve(floor);
      });
    });
  }

  function getFloorsInfo(tenantId, userId) {
    return getFloors(tenantId, tableNames.publicFloors).then(publicFloors => {
      return getFloors(tenantId, tableNames.editFloors).then(editingFloors => {
        return getTmpFloors(tenantId, tableNames.editFloors, userId).then(editingTmpFloors => {
          console.log('publicFloors: ' + JSON.stringify(publicFloors));
          console.log('editingFloors: ' + JSON.stringify(editingFloors));
          console.log('editingTmpFloors: ' + JSON.stringify(editingTmpFloors));
          var floorInfos = {};
          publicFloors.forEach((floor) => {
            floorInfos[floor.id] = floorInfos[floor.id] || [];
            floorInfos[floor.id][0] = floor;
          });
          editingFloors.forEach((floor) => {
            floorInfos[floor.id] = floorInfos[floor.id] || [];
            floorInfos[floor.id][1] = floor;
          });
          editingTmpFloors.forEach((floor) => {
            floorInfos[floor.id] = floorInfos[floor.id] || [];
            floorInfos[floor.id][1] = floor;
          });
          var values = Object.keys(floorInfos).map((key) => {
            return floorInfos[key];
          });
          console.log('values: ' + JSON.stringify(values));
          return Promise.resolve(values);
        });
      });
    });
  }

  function getObjectsByPersonId(tableName, personId) {
    return new Promise((resolve, reject) => {
      var params = {
        TableName: tableName,
        IndexName: 'personId-index',
        KeyConditionExpression: 'personId = :personId',
        FilterExpression: 'deleted = :deleted',
        ProjectionExpression: 'floorId, id, backgroundColor, bold, color, fontSize, height, personId, shape, #url, #type, updateAt, width, x, y, #name',
        ExpressionAttributeValues: {
          ':personId': personId,
          ':deleted': false
        },
        ExpressionAttributeNames: {
          '#type': 'type',
          '#name': 'name',
          '#url': 'url'
        }
      };

      console.log('params: ' + JSON.stringify(params));
      client.query(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          console.log('data.Items: ', JSON.stringify(data.Items));
          resolve(data.Items);
        }
      });
    });
  }


  function getObjectByIdFromPublicFloor(tenantId, objectId) {
    return new Promise((resolve, reject) => {
      var params = {
        TableName: tableNames.publicObjects,
        IndexName: 'id-index',
        KeyConditionExpression: 'id = :objectId',
        ExpressionAttributeValues: {
          ':objectId': objectId
        },
      };


      console.log('params: ' + JSON.stringify(params));
      client.query(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          console.log('data.Items: ', JSON.stringify(data.Items));
          resolve(data.Items[0]);
        }
      });
    });
  }

  function deleteFloorWithObjects(tenantId, floorId) {
    return deleteFloor(tenantId, floorId, tableNames.editFloors).then(() => {
      return deleteFloor(tenantId, floorId, tableNames.publicFloors).then(() => {
        return getObjects(floorId, tableNames.publicObjects).then((publicObjects) => {
          return deleteObjects(publicObjects, tableNames.publicObjects).then(() => {
            return Promise.resolve();
          });
        });
      });
    });
  }

  function getFloors(tenantId, table_name) {
    return new Promise((resolve, reject) => {

      var params = {
        TableName: table_name,
        KeyConditionExpression: 'tenantId = :tenantId',
        FilterExpression: '#temporary = :temporary',
        ExpressionAttributeValues: {
          ':tenantId': tenantId,
          ':temporary': false
        },
        ExpressionAttributeNames: {
          '#temporary': 'temporary'
        }
      };
      client.query(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data.Items);
        }
      });
    });
  }

  function getTmpFloors(tenantId, table_name, userId) {
    return new Promise((resolve, reject) => {

      var params = {
        TableName: table_name,
        KeyConditionExpression: 'tenantId = :tenantId',
        FilterExpression: 'updateBy = :updateBy and #temporary = :temporary',
        ExpressionAttributeValues: {
          ':tenantId': tenantId,
          ':updateBy': userId,
          ':temporary': true
        },
        ExpressionAttributeNames: {
          '#temporary': 'temporary'
        }
      };
      client.query(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data.Items);
        }
      });
    });
  }

  function getFloor(tenantId, id, table_name) {
    return new Promise((resolve, reject) => {

      var params = {
        TableName: table_name,
        Key: {
          id: id,
          tenantId: tenantId
        }
      };
      console.log('parms: ', JSON.stringify(params));
      client.get(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data.Item);
        }
      });
    });
  }



  function putFloor(floor, table_name) {
    return new Promise((resolve, reject) => {

      for (var property in floor)
      if (floor[property] === '') delete floor[property];
      var params = {
        TableName: table_name,
        Item: floor
      };
      console.log('params: ' + JSON.stringify(params));
      client.put(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  function deleteFloor(tenantId, floorId, table_name) {
    return new Promise((resolve, reject) => {

      var params = {
        TableName: table_name,
        Key: {
          id: floorId,
          tenantId: tenantId
        }
      };
      client.delete(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  function setAttributions(change, updates) {
    return new Promise((resolve, reject) => {
      for (var property in change.object) {
        if (property !== 'floorId' && property !== 'id') {
          if (change.object[property] !== null && change.object[property] !== '') {
            updates[property] = {
              Action: 'PUT',
              Value: change.object[property]
            };
          } else {
            updates[property] = {
              Action: 'DELETE'
            };
          }
        }
      }
      if (!updates) reject('Unknown Error');
      else resolve(updates);
    });
  }


  function saveObjectsChange(changes) {
    var updateAt = Date.now();
    return Promise.all(changes.map((change) => {
      console.log('change: ' + JSON.stringify(change));
      change.object.updateAt = updateAt;
      if (change.flag == 'added') {
        for (var property in change.object) {
          if (change.object[property] === '' || change.object[property] === null) {
            delete change.object[property];
          }
        }
        change.object.changed = true;
        change.object.deleted = false;
        return putObject(change.object, tableNames.editObjects).then(() => {
          change.result = 'success';
          return Promise.resolve(change);
        }).catch(() => {
          change.result = 'failure';
          return Promise.resolve(change);
        });
      } else if (change.flag == 'modified') {
        change.object.changed = true;
        change.object.deleted = false;
        return setAttributions(change, {}).then((updates) => {
          return updateObject(change.object.floorId, change.object.id, updates, tableNames.editObjects).then(() => {
            change.result = 'success';
            return Promise.resolve(change);
          }).catch(() => {
            change.result = 'failure';
            return Promise.resolve(change);
          });
        });
      } else if (change.flag == 'deleted') {
        change.object.changed = true;
        change.object.deleted = true;
        return deleteObject(change.object.floorId, change.object.id, tableNames.editObjects).then(() => {
          change.result = 'success';
          return Promise.resolve(change);
        }).catch(() => {
          change.result = 'failure';
          return Promise.resolve(change);
        });
      } else {
        Promise.reject('valid flag is not set');
      }
    }));
  }


  function getObjects(floorId, table_name) {
    return new Promise((resolve, reject) => {
      var params = {
        TableName: table_name,
        KeyConditionExpression: 'floorId = :floorId',
        FilterExpression: 'deleted = :deleted',
        ProjectionExpression: 'floorId, id, backgroundColor, bold, color, fontSize, height, personId, shape, #url, #type, updateAt, width, x, y, #name',
        ExpressionAttributeValues: {
          ':floorId': floorId,
          ':deleted': false
        },
        ExpressionAttributeNames: {
          '#type': 'type',
          '#name': 'name',
          '#url': 'url'
        }
      };

      client.query(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data.Items);
        }
      });
    });
  }

  function getChangedObjects(floorId, table_name) {
    return new Promise((resolve, reject) => {

      var params = {
        TableName: table_name,
        KeyConditionExpression: 'floorId = :floorId',
        FilterExpression: 'changed = :changed',
        ExpressionAttributeValues: {
          ':floorId': floorId,
          ':changed': true
        }
      };
      console.log('params: ', JSON.stringify(params));
      client.query(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data.Items);
        }
      });
    });
  }

  function reflectChangedObjects(objects) {
    return Promise.all(objects.map((object) => {
      // var func = objects.deleted? deleteObject(object.floorId, object.id, table_name): putObject(object, table_name);
      object.changed = true;
      putObject(object, tableNames.publicObjects).then(() => {
        return updateChangedObject(object.floorId, object.id, tableNames.editObjects);
      });
    }));
  }

  function putObject(object, table_name) {
    return new Promise((resolve, reject) => {

      for (var property in object)
      if (object[property] === '') delete object[property];

      var params = {
        TableName: table_name,
        Item: object
      };
      console.log('params: ' + JSON.stringify(params));
      client.put(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  function updateObject(floorId, objectId, updates, table_name) {
    return new Promise((resolve, reject) => {

      // for (var property in object)
      // if (object[property] === '') delete object[property];
      var params = {
        TableName: table_name,
        Key: {
          'floorId': floorId,
          'id': objectId
        },
        AttributeUpdates: updates
      };
      console.log('params: ' + JSON.stringify(params));
      client.update(params, function(err, data) {
        if (err) {
          console.log('err in updateObject: ' + (err));
          reject(err);
        } else {
          // console.log('updatedData: ' + JSON.stringify(data));
          resolve(data);
        }
      });
    });
  }


  function deleteObjects(objects, table_name) {
    console.log('objects: ' + objects);
    return objects.reduce((memo, object) => {
      return memo.then(() => {
        return deleteObject(object.floorId, object.id, table_name);
      });
    }, Promise.resolve());
  }

  function deleteObject(floorId, objectId, table_name) {
    return new Promise((resolve, reject) => {

      var params = {
        TableName: table_name,
        Key: {
          'floorId': floorId,
          'id': objectId
        },
        UpdateExpression: 'SET #deleted = :deleted, #changed = :changed',
        ExpressionAttributeNames: {
          '#deleted': 'deleted',
          '#changed': 'changed'
        },
        ExpressionAttributeValues: {
          ':deleted': true,
          ':changed': true
        },
      };
      console.log('params: ' + JSON.stringify(params));
      client.update(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  function getPrototypes(tenantId) {
    return new Promise((resolve, reject) => {
      var params = {
        TableName: tableNames.prototypes,
        KeyConditionExpression: 'tenantId = :tenantId',
        ExpressionAttributeValues: {
          ':tenantId': tenantId
        }
      };
      console.log('params: ', JSON.stringify(params));
      client.query(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data.Items);
        }
      });
    });
  }

  function putPrototypes(tenantId, prototypes) {
    console.log('prototypes: ' + JSON.stringify(prototypes));
    return prototypes.reduce((memo, prototype) => {
      return memo.then(() => {
        return putPrototype(tenantId, prototype);
      });
    }, Promise.resolve());
  }

  function putPrototype(tenantId, prototype) {
    console.log('prototype: ' + JSON.stringify(prototype));
    return new Promise((resolve, reject) => {
      prototype.tenantId = tenantId;
      for (var property in prototype)
      if (prototype[property] === '') delete prototype[property];
      var params = {
        TableName: tableNames.prototypes,
        Item: prototype
      };
      console.log('params: ' + JSON.stringify(params));
      client.put(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  function deletePrototypes(tenantId, prototypes) {
    console.log('prototypes: ' + JSON.stringify(prototypes));
    return prototypes.reduce((memo, prototype) => {
      return memo.then(() => {
        return putPrototype(tenantId, prototype.id);
      });
    }, Promise.resolve());
  }

  function deletePrototype(tenantId, prototypeId) {
    return new Promise((resolve, reject) => {
      var params = {
        TableName: tableNames.prototypes,
        Key: {
          id: prototypeId,
          tenantId: tenantId
        }
      };
      console.log('params: ' + JSON.stringify(params));
      client.delete(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }


  function saveColors(tenantId, newColors) {
    return getColors(tenantId).then((oldColors) => {
      return deleteColors(tenantId, oldColors).then(() => {
        return putColors(tenantId, newColors);
      });
    });
  }

  function getColors(tenantId) {
    return new Promise((resolve, reject) => {
      var params = {
        TableName: tableNames.colors,
        KeyConditionExpression: 'tenantId = :tenantId',
        ExpressionAttributeValues: {
          ':tenantId': tenantId
        }
      };
      console.log('params: ', params);
      client.query(params, function(err, data) {
        if (err) {
          console.log('err: ', err);
          reject(err);
        } else {
          console.log('data: ', data);
          resolve(data.Items);
        }
      });
    });
  }

  function putColors(tenantId, colors) {
    return colors.reduce((memo, color) => {
      return memo.then(() => {
        return putColor(tenantId, color);
      });
    }, Promise.resolve());
  }

  function putColor(tenantId, color) {
    return new Promise((resolve, reject) => {
      color.tenantId = tenantId;
      for (var property in color)
      if (color[property] === '') delete color[property];
      var params = {
        TableName: tableNames.colors,
        Item: color
      };
      console.log('params: ' + JSON.stringify(params));
      client.put(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          console.log('data: ' + JSON.stringify(data));
          resolve(data);
        }
      });
    });
  }

  function deleteColors(tenantId, colors) {
    return colors.reduce((memo, color) => {
      return memo.then(() => {
        return deleteColor(tenantId, color.id);
      });
    }, Promise.resolve());
  }

  function deleteColor(tenantId, colorId) {
    return new Promise((resolve, reject) => {
      var params = {
        TableName: tableNames.colors,
        Key: {
          id: colorId,
          tenantId: tenantId
        }
      };
      client.delete(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          console.log('data', data);
          resolve();
        }
      });
    });
  }

  //--search

  function searchPeopleWithObjects(option, people) {

    var tableName = option ? tableNames.editObjects : tableNames.publicObjects;

    return people.reduce((memo, person) => {
      return memo.then((results) => {
        return getObjectsByPersonId(tableName, person.id).then((objects) => {
          console.log('objects: ', JSON.stringify(objects));
          var obj = {};
          obj.person = person;
          obj.objects = objects;
          results.push(obj);
          console.log('results: ', JSON.stringify(results));
          return Promise.resolve(results);
        });
      });
    }, Promise.resolve([]));
  }

  function searchObjects(tenantId, option, query) {
    var floorTableName = option ? tableNames.editFloors : tableNames.publicFloors;
    console.log('floorTableName: ', floorTableName);
    return getFloors(tenantId, floorTableName).then((floors) => {
      return floors.reduce((memo, floor) => {
        return memo.then((results) => {
          var objectTableName = option ? tableNames.editObjects : tableNames.publicObjects;
          console.log('objectTableName: ', objectTableName);
          return getObjectsByName(floor.id, objectTableName, query).then((objects) => {
            return Promise.resolve(results.concat(objects));
          });
        });
      }, Promise.resolve([]));
    });
  }

  function getObjectsByName(floorId, table_name, query) {
    return new Promise((resolve, reject) => {
      var params = {
        TableName: table_name,
        KeyConditionExpression: 'floorId = :floorId',
        FilterExpression: 'deleted = :deleted AND contains(#name, :name)',
        ProjectionExpression: 'floorId, id, backgroundColor, bold, color, fontSize, height, personId, shape, #url, #type, updateAt, width, x, y, #name',
        ExpressionAttributeValues: {
          ':floorId': floorId,
          ':deleted': false,
          ':name': query
        },
        ExpressionAttributeNames: {
          '#type': 'type',
          '#name': 'name',
          '#url': 'url'
        }
      };
      console.log('params: ' + JSON.stringify(params));
      client.query(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          console.log('data: ' + JSON.stringify(data));
          resolve(data.Items);
        }
      });
    });
  }

  return {
    getFloors: getFloors,
    getTmpFloors:getTmpFloors,
    getColors: getColors,
    getFloorsInfo: getFloorsInfo,
    saveEditingFloor: saveEditingFloor,
    deleteFloorWithObjects: deleteFloorWithObjects,
    saveObjectsChange: saveObjectsChange,
    getFloorWithObjects: getFloorWithObjects,
    publishFloor: publishFloor,
    saveColors: saveColors,
    getPrototypes: getPrototypes,
    putPrototypes: putPrototypes,
    putPrototype: putPrototype,
    deletePrototypes: deletePrototypes,
    deletePrototype: deletePrototype,
    getObjectByIdFromPublicFloor: getObjectByIdFromPublicFloor,
    searchPeopleWithObjects: searchPeopleWithObjects,
    searchObjects: searchObjects
  };
}

module.exports = create;
