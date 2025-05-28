const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'Resources';

const validTypes = ['helpline', 'counseling', 'support_group', 'emergency'];

async function addResource({ title, description, contactInfo, url, type }) {
  if (!validTypes.includes(type)) {
    throw new Error('Invalid resource type');
  }

  const params = {
    TableName: TABLE_NAME,
    Item: {
      resourceId: uuidv4(),
      title,
      description: description || null,
      contactInfo: contactInfo || null,
      url: url || null,
      type,
    },
  };

  await dynamodb.put(params).promise();
  return params.Item;
}

module.exports = { addResource };
