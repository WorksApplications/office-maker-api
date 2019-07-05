import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import axios from 'axios';
import fs from 'fs';
const uuid = require('uuid/v4');

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
};

before(() => {
  endpoint = JSON.parse(fs.readFileSync('endpoint.json').toString());
});

describe('Floor edit', () => {
  const floorId = uuid();

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
      axios.patch(`${endpoint.restApi.url}/objects`, [
        {
          flag: 'added',
          result: 'success',
          object: {
            id: objectId,
            floorId: floorId
          }
        }
      ])
    ).to.be.rejectedWith('401');
  });

  it('should create an object on the floor', async () => {
    await axios.patch(
      `${endpoint.restApi.url}/objects`,
      [
        {
          flag: 'added',
          result: 'success',
          object: {
            backgroundColor: '#eee',
            id: objectId,
            floorId: floorId,
            width: 0,
            height: 0,
            x: 0,
            y: 0
          }
        }
      ],
      {
        headers: {
          Authorization: `Bearer ${endpoint.systemJWT}`
        }
      }
    );
  });

  it('should delete the floor by admin user', async () => {
    await axios.delete(`${endpoint.restApi.url}/floors/${floorId}/edit`, {
      headers: {
        Authorization: `Bearer ${endpoint.systemJWT}`
      }
    });
  });
});
