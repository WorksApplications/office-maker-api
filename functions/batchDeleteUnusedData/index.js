'use strict';

console.log('Loading function');

const commonModule = require(process.cwd()+'/common');

exports.handler = (event, context, callback) => {
	console.log('Received event:', JSON.stringify(event, null, 2));
	const db = commonModule.db(event);
	return db.deleteUnusedData(false).then(() => {
		console.log('delete complete for all public data');
	}).catch((err) =>{
		console.log('err: ', err);
		console.log('still have some public data');
	}).finally(() => {
		return db.deleteUnusedData(true).then(() => {
			console.log('delete complete for all edit data');
		}).catch((err) => {
			console.log('err: ', err);
			console.log('still have some public data');
		}).finally(() => {
			commonModule.lambdaUtil(event).send(callback, 200, 'done');
		});
	});
};
