function create(event) {
  function send(callback, statusCode, data) {
    callback(null, {
      statusCode: statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
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
