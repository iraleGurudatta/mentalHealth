const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'Feedback';

async function addFeedback({ userId, message, status = 'pending' }) {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      feedbackId: uuidv4(),
      userId: userId || null,
      message,
      submittedAt: new Date().toISOString(),
      status,
    },
  };
  await dynamodb.put(params).promise();
  return params.Item;
}

module.exports = { addFeedback };
