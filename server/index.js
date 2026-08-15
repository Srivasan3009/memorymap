import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { generateKnowledgeMap, explainConcept, generateQuiz, evaluateAnswer, generateStudyPlan, askQuestion } from './ai.js';

// Load server/.env (dotenv/config defaults to CWD, but the server lives in /server)
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

function requireKey(req, res, next) {
  const configured = process.env.API_KEY;
  if (configured && req.headers.authorization !== `Bearer ${configured}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.use(requireKey);

app.post('/api/ai/knowledge-map', async (req, res) => {
  try { res.json(await generateKnowledgeMap(req.body.input)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/ai/explain', async (req, res) => {
  try { res.json(await explainConcept(req.body)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/ai/quiz', async (req, res) => {
  try { res.json(await generateQuiz(req.body)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/ai/evaluate', async (req, res) => {
  try { res.json(await evaluateAnswer(req.body)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/ai/study-plan', async (req, res) => {
  try { res.json(await generateStudyPlan(req.body)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/ai/ask', async (req, res) => {
  try { res.json(await askQuestion(req.body)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/health', (req, res) => res.json({ ok: true, mode: process.env.AI_PROVIDER || 'mock' }));

app.listen(PORT, () => {
  console.log(`MemoryMap AI server running on http://localhost:${PORT}`);
});