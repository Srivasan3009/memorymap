import { MockAIProvider } from '../src/services/providers/mockAIProvider.js';
import { schemaFor } from './schema.js';

const mock = new MockAIProvider();

// Server-side AI proxy. By default it runs in mock mode (same as the client)
// so the demo works with no keys. Set AI_PROVIDER=gemini (or openai) plus the
// matching API key to use a real provider. Swap this file's internals per
// provider — the API surface stays identical to the client aiService.

function getProvider() {
  return (process.env.AI_PROVIDER || 'mock').toLowerCase();
}

async function runWithRealAI(path, payload) {
  const provider = getProvider();
  if (provider === 'gemini') return generateWithGemini(path, payload);
  if (provider === 'groq') return generateWithGroq(path, payload);
  if (provider === 'openai') return generateWithOpenAI(path, payload);
  if (provider === 'openrouter') return generateWithOpenRouter(path, payload);
  throw new Error(`Unknown AI_PROVIDER: ${provider}`);
}

export async function generateKnowledgeMap(input) {
  if (getProvider() === 'mock') {
    return mock.generateKnowledgeMap(input);
  }
  return runWithRealAI('/knowledge-map', input);
}

export async function explainConcept(body) {
  if (getProvider() === 'mock') {
    return mock.explainConcept(body);
  }
  return runWithRealAI('/explain', body);
}

export async function generateQuiz(body) {
  if (getProvider() === 'mock') {
    return mock.generateQuiz(body);
  }
  return runWithRealAI('/quiz', body);
}

export async function evaluateAnswer(body) {
  if (getProvider() === 'mock') {
    return mock.evaluateAnswer(body);
  }
  return runWithRealAI('/evaluate', body);
}

export async function generateStudyPlan(body) {
  if (getProvider() === 'mock') {
    return mock.generateStudyPlan(body);
  }
  return runWithRealAI('/study-plan', body);
}

export async function askQuestion(body) {
  if (getProvider() === 'mock') {
    return mock.askQuestion(body);
  }
  return runWithRealAI('/ask', body);
}

function systemPrompt(path) {
  return `You are MemoryMap, an AI that builds knowledge maps and learning content. Respond in strict JSON with no markdown, no prose, no code fences — only a valid JSON object.

${schemaFor(path)}`;
}

async function generateWithOpenAI(path, payload) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
  return openAiCompatible(path, payload, {
    baseUrl: 'https://api.openai.com/v1',
    apiKey,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    name: 'OpenAI'
  });
}

async function generateWithOpenRouter(path, payload) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');
  return openAiCompatible(path, payload, {
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey,
    model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
    name: 'OpenRouter',
    extraHeaders: {
      'HTTP-Referer': 'https://srivasan3009.github.io/knowledge-map/',
      'X-Title': 'MemoryMap'
    }
  });
}

async function openAiCompatible(path, payload, { baseUrl, apiKey, model, name, extraHeaders = {} }) {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}`, ...extraHeaders },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt(path) },
        { role: 'user', content: JSON.stringify(payload) }
      ],
      response_format: { type: 'json_object' }
    })
  });
  if (!res.ok) throw new Error(`${name} error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty AI response');
  return parseJson(content);
}

async function generateWithGroq(path, payload) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');
  return openAiCompatible(path, payload, {
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey,
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    name: 'Groq'
  });
}

async function generateWithGemini(path, payload) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt(path)}\n\nInput:\n${JSON.stringify(payload)}` }] }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    })
  });
  if (!res.ok) throw new Error(`Gemini error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty AI response');
  return parseJson(text);
}

function parseJson(text) {
  const cleaned = String(text).trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // The model sometimes wraps JSON in ```json fences — strip them.
    const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) return JSON.parse(fenced[1]);
    throw new Error('AI response was not valid JSON');
  }
}