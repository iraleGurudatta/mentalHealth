require('dotenv').config();
const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Valid moods for validation
const validMoods = ['happy', 'neutral', 'sad', 'anxious', 'angry', 'depressed'];

// Root route
app.get('/', (req, res) => {
  res.send('Mental Health Chatbot API is running');
});

// POST /feedback
app.post('/feedback', async (req, res) => {
  const { message } = req.body;

  const params = {
    TableName: 'Feedback',
    Item: {
      feedbackId: uuidv4(),
      message,
      submittedAt: new Date().toISOString(),
    },
  };

  try {
    await dynamodb.put(params).promise();
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error saving feedback' });
  }
});

// POST /chat
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // or "gpt-4" if you have access
      messages: [
        { role: 'system', content: 'You are a kind and supportive mental health assistant.' },
        { role: 'user', content: message },
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to get chatbot response' });
  }
});

// POST /mood
app.post('/mood', async (req, res) => {
  const { userId, mood, notes } = req.body;

  if (!validMoods.includes(mood)) {
    return res.status(400).json({ error: 'Invalid mood value' });
  }

  const params = {
    TableName: 'MoodEntries',
    Item: {
      entryId: uuidv4(), // ✅ Updated key
      userId: userId || null,
      mood,
      notes: notes || null,
      createdAt: new Date().toISOString(),
    },
  };

  try {
    await dynamodb.put(params).promise();
    res.status(201).json({ message: 'Mood entry added successfully', data: params.Item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error saving mood entry' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
// GET /mood
app.get('/mood', async (req, res) => {
  const { userId } = req.query;

  const params = {
    TableName: 'MoodEntries',
    ...(userId && {
      FilterExpression: 'userId = :uid',
      ExpressionAttributeValues: { ':uid': userId },
    }),
  };

  try {
    const data = await dynamodb.scan(params).promise();
    res.status(200).json({ moodEntries: data.Items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching mood entries' });
  }
});
