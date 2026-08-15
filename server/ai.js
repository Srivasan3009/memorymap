import { MockAIProvider } from '../src/services/providers/mockAIProvider.js';

const mock = new MockAIProvider();

// Server-side AI proxy. By default it runs in mock mode (same as the client)
// so the demo works with no keys. Set AI_PROVIDER=openai and OPENAI_API_KEY
// to use a real provider. Swap this file's internals per provider — the API
// surface stays identical to the client aiService.

export async function generateKnowledgeMap(input) {
  const provider = process.env.AI_PROVIDER || 'mock';
  if (provider === 'mock') {
    return mock.generateKnowledgeMap(input);
  }
  if (provider === 'openai') {
    return generateWithOpenAI('/knowledge-map', input);
  }
  throw new Error(`Unknown AI_PROVIDER: ${provider}`);
}

export async function explainConcept(body) {
  const provider = process.env.AI_PROVIDER || 'mock';
  if (provider === 'mock') {
    return mock.explainConcept(body);
  }
  return generateWithOpenAI('/explain', body);
}

export async function generateQuiz(body) {
  const provider = process.env.AI_PROVIDER || 'mock';
  if (provider === 'mock') {
    return mock.generateQuiz(body);
  }
  return generateWithOpenAI('/quiz', body);
}

export async function evaluateAnswer(body) {
  const provider = process.env.AI_PROVIDER || 'mock';
  if (provider === 'mock') {
    return mock.evaluateAnswer(body);
  }
  return generateWithOpenAI('/evaluate', body);
}

export async function generateStudyPlan(body) {
  const provider = process.env.AI_PROVIDER || 'mock';
  if (provider === 'mock') {
    return mock.generateStudyPlan(body);
  }
  return generateWithOpenAI('/study-plan', body);
}

export async function askQuestion(body) {
  const provider = process.env.AI_PROVIDER || 'mock';
  if (provider === 'mock') {
    return mock.askQuestion(body);
  }
  return generateWithOpenAI('/ask', body);
}

async function generateWithOpenAI(path, payload) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are MemoryMap, an AI that builds knowledge maps and learning content. Respond in strict JSON. Request: ${path}`
        },
        { role: 'user', content: JSON.stringify(payload) }
      ],
      response_format: { type: 'json_object' }
    })
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty AI response');
  return JSON.parse(content);
}