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

describe('Floors', () => {
  it('create a temporary floor', async () => {
    const floorId = uuid();
    const putResponse = await axios.put(
      `${host}/floors/${floorId}/edit`,
      {
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
      },
      {
        headers: {
          Authorization: `Bearer ${testUserToken}`
        }
      }
    );
    expect(putResponse.status).eq(200);

    const result = await axios.get(`${host}/floors`);
    console.log(result.data);
  });
});
