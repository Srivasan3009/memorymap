import { MockAIProvider } from './providers/mockAIProvider';
import { OpenRouterClientProvider } from './providers/openrouterClientProvider';
import { KnowledgeMap } from '../utils/types';

// Unified AI service abstraction.
//
// The app never talks to a specific provider directly. Every AI operation
// goes through the methods here. To swap providers, add a new provider that
// implements the same interface and switch it in `getProvider()`.
//
//   AI Service
//    ├── generateKnowledgeMap()
//    ├── explainConcept()
//    ├── generateQuiz()
//    ├── evaluateAnswer()
//    └── generateStudyPlan()
//
// Provider selection (highest priority first):
//   1. VITE_OPENROUTER_API_KEY  → OpenRouter, called directly from the browser
//      (works on static hosts like GitHub Pages, no backend needed)
//   2. VITE_API_URL             → local/cloud Express proxy (server/)
//   3. Otherwise                → mock provider (demo mode, zero setup)

const API_URL = import.meta.env.VITE_API_URL || '';
const API_KEY = import.meta.env.VITE_API_KEY || '';
const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

class AIProxyProvider {
  async generateKnowledgeMap(input) {
    const data = await this.post('/api/ai/knowledge-map', { input });
    return new KnowledgeMap({
      id: `map-${Date.now()}`,
      title: data.title || input.title || 'Untitled map',
      subject: data.subject || 'Custom',
      source: 'ai',
      concepts: data.concepts || [],
      relationships: data.relationships || [],
      createdAt: Date.now(),
      mastery: {}
    });
  }
  async explainConcept({ map, conceptId, studentLevel }) {
    return this.post('/api/ai/explain', { map, conceptId, studentLevel });
  }
  async generateQuiz({ map, conceptIds, count }) {
    return this.post('/api/ai/quiz', { map, conceptIds, count });
  }
  async evaluateAnswer({ question, answer }) {
    return this.post('/api/ai/evaluate', { question, answer });
  }
  async generateStudyPlan({ map, weakConcepts }) {
    return this.post('/api/ai/study-plan', { map, weakConcepts });
  }
  async askQuestion({ map, conceptId, question }) {
    return this.post('/api/ai/ask', { map, conceptId, question });
  }
  async post(path, body) {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI request failed (${res.status}): ${text}`);
    }
    return res.json();
  }
}

function getProvider() {
  // 1. OpenRouter direct (static-host friendly) — highest priority.
  if (OPENROUTER_KEY) {
    return new OpenRouterClientProvider();
  }
  // 2. Express proxy (local dev or cloud backend).
  if (API_URL) {
    return new AIProxyProvider();
  }
  // 3. Mock/demo mode.
  return new MockAIProvider();
}

export const ai = getProvider();

export { API_URL as AI_CONFIGURED }; // truthy when a proxy backend is configured
export { OPENROUTER_KEY as OPENROUTER_CONFIGURED }; // truthy when OpenRouter is wired