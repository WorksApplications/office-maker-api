function create(event) {
  let accessControlAllowOrigin = event.stageVariables.AccessControlAllowOrigin;

  function send(callback, statusCode, data) {
    callback(null, {
      statusCode: statusCode,
      headers: {
        'Access-Control-Allow-Origin': accessControlAllowOrigin,
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : ''
    });
  }
  return {
    send: send
  };
}

module.exports = create;
