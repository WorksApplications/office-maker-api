import { expect } from 'chai';
import axios from 'axios';
import fs from 'fs';
const uuid = require('uuid/v4');

let endpoint: {
  restApi: {
    url: string;
  };
  appsync: {
    url: string;
    apiKey: string;
  };
};

before(() => {
  endpoint = JSON.parse(fs.readFileSync('endpoint.json').toString());
});

describe('Floor edit', () => {
  const floorId = uuid();

  it('should create a floor', async () => {
    await axios.put(`${endpoint.restApi.url}/floors/${floorId}/edit`, {
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
    });
  });

  it('should show the floor in listFloors response', async () => {
    const result = await axios.get(`${endpoint.restApi.url}/floors`);
    console.log(JSON.stringify(result));
  });
});
