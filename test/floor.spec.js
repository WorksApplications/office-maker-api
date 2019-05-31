const expect = require('chai').expect;
const axios = require('axios').default;
const uuid = require('uuid/v4');
const host = 'http://localhost:3000';

// if you use non-default profile, AWS_PROFILE needs to be set
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
  let floorId;

  it('should create a temporary floor', async () => {
    floorId = uuid();
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
    expect(getResponse.data.objects.length).eq(0);
  });

  let objectId;

  it('should create a new object on the floor', async () => {
    objectId = uuid();

    const objectsInfo = [
      {
        flag: 'added',
        object: {
          backgroundColor: '#eee',
          changed: true,
          deleted: false,
          floorId: floorId,
          height: 96,
          id: objectId,
          updateAt: new Date().getTime(),
          width: 56,
          x: 440,
          y: 136
        },
        result: 'success'
      }
    ];
    const patchResponse = await axios.patch(
      `${host}/objects`,
      objectsInfo,
      authHeaderOption
    );
    expect(patchResponse.status).eq(200);

    const getResponse = await axios.get(
      `${host}/floors/${floorId}/edit`,
      authHeaderOption
    );
    expect(getResponse.status).eq(200);
    expect(getResponse.data.objects.length).eq(1);
    expect(getResponse.data.objects[0].id).eq(objectId);
  });

  it('should delete the floor', async () => {
    const deleteResponse = await axios.delete(
      `${host}/floors/${floorId}/edit`,
      authHeaderOption
    );
    expect(deleteResponse.status).eq(200);

    const getResponsePromise = axios.get(
      `${host}/floors/${floorId}/edit`,
      authHeaderOption
    );

    await getResponsePromise
      .then(_ => {
        assert.fail(true, false, 'unreachable');
      })
      .catch(err => {
        expect(err.response.status).eq(404);
      });
  });
});
