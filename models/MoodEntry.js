require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { addMoodEntry } = require('./moodModel'); // Adjust path if needed

const app = express();

app.use(cors());
app.use(express.json());

app.post('/mood', async (req, res) => {
  const { userId, mood, notes } = req.body;

  try {
    const newEntry = await addMoodEntry({ userId, mood, notes });
    res.status(201).json({ message: 'Mood entry added', moodEntry: newEntry });
  } catch (error) {
    console.error('Error adding mood entry:', error);
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
