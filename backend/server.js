const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Result = require('./models/Result');
const Question = require('./models/Question');
const Philosopher = require('./models/Philosopher');

const app = express();
const port = Number(process.env.PORT) || 5000;
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.json({ limit: '20kb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

app.get('/questions', async (_req, res) => {
  try {
    const questions = await Question.find().sort({ order: 1, _id: 1 }).lean();
    res.json(questions);
  } catch (_error) {
    res.status(503).json({ message: 'Questions are temporarily unavailable.' });
  }
});

app.get('/philosophers', async (_req, res) => {
  try {
    const philosophers = await Philosopher.find().select('name description tradition featuredWorks weights').sort({ name: 1 }).lean();
    res.json(philosophers);
  } catch (_error) {
    res.status(503).json({ message: 'Philosophers are temporarily unavailable.' });
  }
});

app.post('/submit', async (req, res) => {
  try {
    const { answers } = req.body || {};
    if (!Array.isArray(answers) || answers.length < 1 || answers.some((answer) => !Number.isInteger(answer) || answer < 1 || answer > 5)) {
      return res.status(400).json({ message: 'Please provide one or more answers, each from 1 to 5.' });
    }

    const [questions, philosophers] = await Promise.all([Question.countDocuments(), Philosopher.find().lean()]);
    if (questions !== answers.length) return res.status(409).json({ message: 'The question set does not match this assessment.' });
    const compatible = philosophers.filter((philosopher) => Array.isArray(philosopher.weights) && philosopher.weights.length > 0);
    if (!compatible.length) return res.status(503).json({ message: 'No compatible philosopher profiles are available.' });

    const scores = compatible.map((philosopher) => ({
      name: philosopher.name,
      percent: Math.round((cosineSimilarity(answers, philosopher.weights) + 1) * 50),
    })).sort((a, b) => b.percent - a.percent);

    await new Result({ answers, scores }).save();
    return res.json(scores);
  } catch (_error) {
    return res.status(503).json({ message: 'Could not process your answers. Please try again.' });
  }
});

function cosineSimilarity(answers, weights) {
  // Older collections can contain more questions than a profile has weights.
  // Compare the dimensions both sides actually define instead of producing NaN.
  const dimensions = Math.min(answers.length, weights.length);
  const a = answers.slice(0, dimensions).map((value) => value - 3);
  const b = weights.slice(0, dimensions).map((value) => value - 3);
  const dot = a.reduce((sum, value, index) => sum + value * b[index], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
  return magnitudeA && magnitudeB ? dot / (magnitudeA * magnitudeB) : 0;
}

async function start() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required. Add it to backend/.env.');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
  app.listen(port, () => console.log(`Socratic Spectrum API listening on port ${port}`));
}

start().catch((error) => {
  console.error(`Could not start API: ${error.message}`);
  process.exit(1);
});
