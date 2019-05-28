const expect = require('chai').expect;
const axios = require('axios').default;
const uuid = require('uuid/v4');
const host = 'http://localhost:3000';

const testUser = {
  role: 'admin',
  tenantId: 'example.com',
  principalId: 'test-user@example.com',
  exp: '',
  userId: 'test-user@example.com',
  tenantDomain: 'example.com'
};
const testUserToken = Buffer.from(JSON.stringify(testUser)).toString('base64');
const authHeaderOption = {
  headers: {
    Authorization: `Bearer ${testUserToken}`
  }
};

describe('Floors', () => {
  it('create a temporary floor', async () => {
    const floorId = uuid();
    const floorInfo = {
      flipImage: false,
      height: 4560,
      id: floorId,
      image: null,
      name: 'New Floor',
      ord: 507,
      realHeight: 7,
      realWidth: 10,
      temporary: true,
      tenantId: testUser.tenantDomain,
      updateAt: new Date().getTime(),
      updateBy: testUser.userId,
      width: 700
    };

    const putResponse = await axios.put(
      `${host}/floors/${floorId}/edit`,
      floorInfo,
      authHeaderOption
    );
    expect(putResponse.status).eq(200);

    const getResponse = await axios.get(
      `${host}/floors/${floorId}/edit`,
      authHeaderOption
    );
    expect(getResponse.status).eq(200);
    expect(getResponse.data).to.not.equal(null);
    expect(getResponse.data.name).eq(floorInfo.name);
    expect(getResponse.data.tenantId).eq(floorInfo.tenantId);
  });
});
