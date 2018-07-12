const AWS = require('aws-sdk'),
    dynamoDb = new AWS.DynamoDB.DocumentClient(),
    processResponse = require('./process-response'),
    IS_CORS = process.env.IS_CORS,
    PRIMARY_KEY = process.env.PRIMARY_KEY;

exports.handler = (event) => {
    if (event.httpMethod === 'OPTIONS') {
		return Promise.resolve(processResponse(IS_CORS));
	}
    if (!event.body) {
        return Promise.resolve(processResponse(IS_CORS, 'invalid', 400));
    }
    const editedItemId = event.pathParameters.id;
    if (!editedItemId) {
        return Promise.resolve(processResponse(IS_CORS, 'invalid', 400));
    }

    const editedItem = JSON.parse(event.body);
    const editedItemProperties = Object.keys(editedItem);
    if (!editedItem || editedItemProperties.length < 1) {
        return Promise.resolve(processResponse(IS_CORS, 'no args provided', 400));
    }

    const key = {};
    key[PRIMARY_KEY] = editedItemId;

    const firstProperty = editedItemProperties.splice(0,1);
    let params = {
        TableName: TABLE_NAME,
        Key: key,
        UpdateExpression: `set ${firstProperty} = :${firstProperty}`,
        ExpressionAttributeValues: {},
        ReturnValues: 'UPDATED_NEW'
    }
    params.ExpressionAttributeValues[`:${firstProperty}`] = editedItem[firstProperty];

    editedItemProperties.forEach(property => {
        params.UpdateExpression += `, ${property} = :${property}`;
        params.ExpressionAttributeValues[`:${property}`] = editedItem[property];
    });

    return dynamoDb.update(params)
    .promise()
    .then(() => (processResponse(IS_CORS)))
    .catch(err => {
        console.log(err);
        return processResponse(IS_CORS, 'dynamo-error', 500);
    });
};