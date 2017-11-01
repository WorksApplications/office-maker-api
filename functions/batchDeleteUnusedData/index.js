'use strict';

console.log('Loading function');

const commonModule = require('common');

exports.handler = (event, context, callback) => {
	console.log('Received event:', JSON.stringify(event, null, 2));
};
