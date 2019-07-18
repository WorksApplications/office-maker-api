import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import axios from 'axios';
import fs from 'fs';
const uuid = require('uuid/v4');
(global as any).WebSocket = require('ws');
import Paho from 'paho-mqtt';

chai.use(chaiAsPromised);

let endpoint: {
  restApi: {
    url: string;
  };
  appsync: {
    url: string;
    apiKey: string;
  };
  systemJWT: string;
} = JSON.parse(fs.readFileSync('endpoint.json').toString());

describe('Floor edit', () => {
  const floorId = uuid();
  let client;
  const patchedObjects = [];

  after(() => {
    client.disconnect();
  });

  it('should connect to subscription', async () => {
    // When using `updatedFloorId`, you need to make sure that mutation resolves updatedFloorId field in response
    const result = await axios.post(
      endpoint.appsync.url,
      {
        query: `subscription S {
          patchedObjects(updatedFloorId: "${floorId}") {
            updatedFloorId
            objects {
              flag
              object {
                id
              }
            }
          }
        }`
      },
      {
        headers: {
          Authorization: `Bearer ${endpoint.systemJWT}`,
          'x-api-key': endpoint.appsync.apiKey,
          'Content-Type': 'application/graphql'
        }
      }
    );

    const sub = {
      wssURL: result.data.extensions.subscription.mqttConnections[0].url,
      client: result.data.extensions.subscription.mqttConnections[0].client,
      topics: result.data.extensions.subscription.mqttConnections[0].topics[0]
    };

    client = new Paho.Client(sub.wssURL, sub.client);
    client.onMessageArrived = message => {
      patchedObjects.push(
        JSON.parse(message.payloadString).data.patchedObjects.objects
      );
    };
    client.connect({
      onSuccess: ctx => {
        client.subscribe(sub.topics);
      },
      useSSL: true,
      timeout: 3,
      mqttVersion: 4,
      onFailure: err => {
        throw err;
      }
    });
  });

  it('should not create a floor by guest', async () => {
    expect(
      axios.put(`${endpoint.restApi.url}/floors/${floorId}/edit`, {
        id: floorId
      })
    ).to.be.rejectedWith('401');
  });

  it('should create a floor by admin user', async () => {
    await axios.put(
      `${endpoint.restApi.url}/floors/${floorId}/edit`,
      {
        id: floorId,
        name: 'New floor',
        ord: 507,
        realWidth: 10,
        realHeight: 7,
        temporary: false,
        width: 7200,
        height: 4560,
        flipImage: false,
        image: null
      },
      {
        headers: {
          Authorization: `Bearer ${endpoint.systemJWT}`
        }
      }
    );
  });

  it('should show the floor in listFloors response', async () => {
    const result = (await axios.get(`${endpoint.restApi.url}/floors`, {
      headers: {
        Authorization: `Bearer ${endpoint.systemJWT}`
      }
    })).data;

    expect(result).to.be.an('array');
    expect(result.length).to.not.equal(0);

    const flat = arr => [].concat(...arr);
    expect(flat(result).find(floor => floor && floor.id == floorId)).not.to
      .undefined;
  });

  const objectId = uuid();

  it('should not create an object by guest', async () => {
    expect(
      axios.post(`${endpoint.appsync.url}`, {
        query: `mutation M { patchObjects(objects: [
        {
          flag: "added",
          object: {
            id: "${objectId}"
            floorId: "${floorId}"
            x: 0
            y: 0
            width: 0
            height: 0
            backgroundColor: "#eee"
          }
          result: "success"
        }]) {
          updatedFloorId
          objects {
            flag
            object { id } }
          }
        }`
      })
    ).to.be.rejectedWith('401');
  });

  it('should create an object on the floor', async () => {
    await axios.post(
      `${endpoint.appsync.url}`,
      {
        query: `mutation M { patchObjects(objects: [
        {
          flag: "added",
          object: {
            id: "${objectId}"
            floorId: "${floorId}"
            x: 0
            y: 0
            width: 0
            height: 0
            backgroundColor: "#eee"
          }
          result: "success"
        }]) {
          updatedFloorId
          objects {
            flag
            object { id } }
          }
        }`
      },
      {
        headers: {
          Authorization: `Bearer ${endpoint.systemJWT}`,
          'x-api-key': endpoint.appsync.apiKey,
          'Content-Type': 'application/graphql'
        }
      }
    );
  });

  it('should show the object on the floor', async () => {
    const result = await axios.post(
      `${endpoint.appsync.url}`,
      {
        query: `{ listEditObjectsOnFloor(floorId: "${floorId}") { id } }`
      },
      {
        headers: {
          Authorization: `Bearer ${endpoint.systemJWT}`,
          'x-api-key': endpoint.appsync.apiKey,
          'Content-Type': 'application/graphql'
        }
      }
    );

    expect(result.data.errors).to.be.undefined;
    expect(
      result.data.data.listEditObjectsOnFloor.find(
        object => object.id == objectId
      )
    ).not.to.undefined;
  });

  it('should not show the deleted object', async () => {
    await axios.post(
      `${endpoint.appsync.url}`,
      {
        query: `mutation M { patchObjects(objects: [
        {
          flag: "deleted",
          object: {
            id: "${objectId}"
            floorId: "${floorId}"
          }
          result: "success"
        }]) {
          updatedFloorId
          objects {
            flag
            object { id } }
          }
        }`
      },
      {
        headers: {
          Authorization: `Bearer ${endpoint.systemJWT}`,
          'x-api-key': endpoint.appsync.apiKey,
          'Content-Type': 'application/graphql'
        }
      }
    );

    const result = await axios.post(
      `${endpoint.appsync.url}`,
      {
        query: `{ listEditObjectsOnFloor(floorId: "${floorId}") { id } }`
      },
      {
        headers: {
          Authorization: `Bearer ${endpoint.systemJWT}`,
          'x-api-key': endpoint.appsync.apiKey,
          'Content-Type': 'application/graphql'
        }
      }
    );

    expect(result.data.errors).to.be.undefined;
    expect(
      result.data.data.listEditObjectsOnFloor.find(
        object => object.id == objectId
      )
    ).to.undefined;
  });

  it('should delete the floor by admin user', async () => {
    await axios.delete(`${endpoint.restApi.url}/floors/${floorId}/edit`, {
      headers: {
        Authorization: `Bearer ${endpoint.systemJWT}`
      }
    });
  });

  it('should receives 2 objects through subscription', async () => {
    expect(patchedObjects.length).to.be.eq(2);
  });
});

describe('Floor publish', () => {
  const floorId = uuid();
  const objectId = uuid();

  before(async () => {
    await axios.put(
      `${endpoint.restApi.url}/floors/${floorId}/edit`,
      {
        id: floorId,
        name: 'New floor',
        ord: 507,
        realWidth: 10,
        realHeight: 7,
        temporary: false,
        width: 7200,
        height: 4560,
        flipImage: false,
        image: null
      },
      {
        headers: {
          Authorization: `Bearer ${endpoint.systemJWT}`
        }
      }
    );

    await axios.post(
      `${endpoint.appsync.url}`,
      {
        query: `mutation M { patchObjects(objects: [
        {
          flag: "added",
          object: {
            id: "${objectId}"
            floorId: "${floorId}"
            x: 0
            y: 0
            width: 0
            height: 0
            backgroundColor: "#eee"
          }
          result: "success"
        }]) { objects { object { id } } } }`
      },
      {
        headers: {
          Authorization: `Bearer ${endpoint.systemJWT}`,
          'x-api-key': endpoint.appsync.apiKey,
          'Content-Type': 'application/graphql'
        }
      }
    );
  });

  it('should publish the floor', async () => {
    await axios.put(`${endpoint.restApi.url}/floors/${floorId}/public`, null, {
      headers: {
        Authorization: `Bearer ${endpoint.systemJWT}`
      }
    });
  });

  it('should show the floor in listFloors response', async () => {
    const result = (await axios.get(`${endpoint.restApi.url}/floors`, {
      headers: {
        Authorization: `Bearer ${endpoint.systemJWT}`
      }
    })).data;

    expect(result).to.be.an('array');
    expect(result.length).to.not.equal(0);

    const flat = arr => [].concat(...arr);
    expect(flat(result).find(floor => floor && floor.id == floorId)).not.to
      .undefined;
  });

  // check if the guest can see the published floor
});
