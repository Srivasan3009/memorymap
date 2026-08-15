import { MockAIProvider } from './providers/mockAIProvider';

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
// If no API key / endpoint is configured, the mock provider powers the whole
// app so the demo works with zero setup.

const API_URL = import.meta.env.VITE_API_URL || '';
const API_KEY = import.meta.env.VITE_API_KEY || '';

class AIProxyProvider {
  async generateKnowledgeMap(input) {
    return this.post('/api/ai/knowledge-map', { input });
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
  // Real AI is only used when an API URL is configured.
  if (API_URL) {
    return new AIProxyProvider();
  }
  return new MockAIProvider();
}

export const ai = getProvider();

export { API_URL as AI_CONFIGURED }; // truthy when a real provider is configured