const AWS = require('aws-sdk'),
    dynamoDb = new AWS.DynamoDB.DocumentClient(),
    processResponse = require('./process-response'),
    IS_CORS = process.env.IS_CORS,
    TABLE_NAME = process.env.TABLE_NAME,
    PRIMARY_KEY = process.env.PRIMARY_KEY;

exports.handler = (event) => {
    if (event.httpMethod === 'OPTIONS') {
		return Promise.resolve(processResponse(IS_CORS));
	}
    if (!event.body) {
        return Promise.resolve(processResponse(IS_CORS, 'no body arguments provided', 400));
    }
    const editedItemId = event.pathParameters.id;
    if (!editedItemId) {
        return Promise.resolve(processResponse(IS_CORS, 'invalid id specified', 400));
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
    .then(() => {
        return processResponse(IS_CORS);
    })
    .catch(dbError => {
        let errorResponse = `Error: Execution update, caused a Dynamodb error, please look at your logs.`;
        if (dbError.code === 'ValidationException') {
            if (dbError.message.includes('reserved keyword')) errorResponse = `Error: You're using AWS reserved keywords as attributes`;
        }
        console.log(dbError);
        return processResponse(IS_CORS, errorResponse, 500);
    });
};