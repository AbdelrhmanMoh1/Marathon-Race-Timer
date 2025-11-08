import express from 'express';
import { insertResult, getAllResults } from './database.js';

const app = express();
app.use(express.json());
app.use(express.static('public')); // To serve index.html and results.html

app.post('/submit', async (req, res) => {
  try {
    const id = await insertResult(req.body);
    res.status(201).json({ message: 'Result submitted', id });
  } catch (err) {
    console.error('❌ DB error:', err);
    res.status(500).json({ error: 'DB insert error' });
  }
});

app.get('/results', async (req, res) => {
  try {
    const results = await getAllResults();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load results' });
  }
});

app.listen(8080, () => {
  console.log('✅ Server running at http://localhost:8080');
});
