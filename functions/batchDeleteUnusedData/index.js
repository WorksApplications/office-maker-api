'use strict';

console.log('Loading function');

const commonModule = require(process.cwd()+'/common');

exports.handler = (event, context, callback) => {
	console.log('Received event:', JSON.stringify(event, null, 2));
	const db = commonModule.db(event);
	return db.deleteUnusedData(false).then(() => {
		return db.deleteUnusedData(true).then(() => {
			commonModule.lambdaUtil(event).send(callback, 200, 'Success');
		}).catch((err) => {
			commonModule.lambdaUtil(event).send(callback, 500, err);
		});
	});
};
