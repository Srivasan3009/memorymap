import { KnowledgeMap } from '../../utils/types';

// Client-side OpenRouter provider.
//
// Calls OpenRouter directly from the browser so the app works on static hosts
// (e.g. GitHub Pages) with no backend. The API key is baked into the bundle at
// build time — anyone can read it from the public JS. Use a free/low-balance
// key and revoke it if it's ever abused.
//
// ⚠️ SECURITY NOTE: exposing a key client-side is a tradeoff. This is intended
// for demos / personal projects. For anything sensitive, use a server proxy.

const KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'openai/gpt-4o-mini';

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

function schemaFor(path) {
  const schemas = {
    '/knowledge-map': `The user input is either a short topic/paste OR the full text of a textbook/study material.
Return a JSON object with EXACTLY these fields:
{
  "title": "string — short map title (use the filename/topic hint when given)",
  "subject": "string — broad subject area",
  "concepts": [
    {
      "id": "string — unique, kebab-case, no spaces",
      "name": "string — concept title",
      "category": "root | major | minor | detail",
      "explanation": "string — 1-3 sentence plain-language explanation",
      "keyPoints": ["string — 2-4 bullet-worthy takeaways"],
      "formula": "string — a relevant formula, equation, or empty string",
      "example": "string — a concrete real-world example or empty string",
      "difficulty": 1,
      "subject": "string — same subject as map",
      "tags": ["string"]
    }
  ],
  "relationships": [
    { "id": "string unique", "source": "string — concept id", "target": "string — concept id", "label": "string — short edge label like 'depends on' or 'is an example of'" }
  ]
}
RULES:
- If the input is a full textbook, create concepts that reflect the BOOK'S OWN chapters and sections. Cover the ENTIRE book, from the table of contents through the final chapters — not just the opening pages.
- Extract REAL concepts from the material — do NOT invent generic scaffolding.
- Use category "root" for the single central topic, "major" for chapters/core ideas, "minor" for sections/key topics, "detail" for specifics.
- For a full book aim for 15-40 concepts so all major chapters are represented; for a short topic aim for 8-20.
- Every relationship source and target must reference an existing concept id.
- Output ONLY the JSON object — no markdown, no commentary.`,
    '/explain': `Return a JSON object with EXACTLY these fields:
{
  "name": "string — concept name",
  "explanation": "string — clear, level-appropriate explanation",
  "analogy": "string — a relatable analogy",
  "keyPoints": ["string"],
  "formula": "string or empty",
  "example": "string — worked example",
  "related": ["string — names of related concepts"],
  "commonMistake": "string or empty",
  "difficulty": 1
}
Output ONLY the JSON object.`,
    '/quiz': `Return a JSON object with EXACTLY this field:
{
  "questions": [
    {
      "id": "string unique",
      "type": "multiple_choice | true_false | short_answer",
      "conceptId": "string — concept the question targets",
      "conceptName": "string — concept display name",
      "question": "string — the question",
      "options": ["string"] or [],
      "correctAnswer": 0,
      "explanation": "string — why this is correct"
    }
  ]
}
- For multiple_choice and true_false: "options" is a non-empty array and "correctAnswer" is the index of the correct option.
- For short_answer: "options" is [] and "correctAnswer" is the answer text.
Generate diverse, genuinely useful questions that test understanding of the given concepts. Output ONLY the JSON object.`,
    '/evaluate': `Return a JSON object with EXACTLY these fields:
{
  "correct": true,
  "explanation": "string — why this is right or wrong, with the correct answer for wrong answers"
}
For short answers judge semantic correctness, not exact wording. Output ONLY the JSON object.`,
    '/study-plan': `Return a JSON object with EXACTLY these fields:
{
  "plan": [
    { "conceptId": "string or null", "title": "string", "description": "string", "duration": "string like '8 min'", "action": "review | quiz" }
  ],
  "totalMinutes": 0,
  "tip": "string — a study tip"
}
Build a realistic, spaced study plan targeting the weak concepts first. Output ONLY the JSON object.`,
    '/ask': `Return a JSON object with EXACTLY this field:
{
  "answer": "string — direct, helpful answer to the student's question about the concept"
}
Output ONLY the JSON object.`
  };
  return schemas[path];
}

async function chat(path, payload) {
  if (!KEY) throw new Error('VITE_OPENROUTER_API_KEY is not set');
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KEY}`,
      'HTTP-Referer': 'https://srivasan3009.github.io/knowledge-map/',
      'X-Title': 'MemoryMap'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are MemoryMap, an AI that builds knowledge maps and learning content. Respond in strict JSON with no markdown, no prose, no code fences — only a valid JSON object.\n\n${schemaFor(path)}`
        },
        { role: 'user', content: JSON.stringify(payload) }
      ]
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error (${res.status}): ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty AI response');
  return parseJson(content);
}

function parseJson(text) {
  const cleaned = String(text).trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) return JSON.parse(fenced[1]);
    throw new Error('AI response was not valid JSON');
  }
}

export class OpenRouterClientProvider {
  async generateKnowledgeMap(input) {
    const data = await chat('/knowledge-map', input);
    const concepts = (data.concepts || []).map((c, i) => ({
      id: c.id || `c${i}`,
      name: c.name || 'Untitled concept',
      category: c.category || 'minor',
      explanation: c.explanation || '',
      keyPoints: c.keyPoints || [],
      formula: c.formula || '',
      example: c.example || '',
      difficulty: c.difficulty || 1,
      subject: c.subject || data.subject || '',
      tags: c.tags || []
    }));
    const relationships = (data.relationships || []).map((r, i) => ({
      id: r.id || `r${i}`,
      source: r.source,
      target: r.target,
      label: r.label || ''
    }));
    return new KnowledgeMap({
      id: `map-${Date.now()}`,
      title: data.title || input.title || 'Untitled map',
      subject: data.subject || 'Custom',
      source: 'ai',
      concepts,
      relationships,
      createdAt: Date.now(),
      mastery: {}
    });
  }

  async explainConcept({ map, conceptId, studentLevel = 'beginner' }) {
    const concept = map.getConcept(conceptId);
    if (!concept) throw new Error('Concept not found');
    const data = await chat('/explain', {
      concept: concept.name,
      explanation: concept.explanation,
      keyPoints: concept.keyPoints,
      formula: concept.formula,
      related: map.getRelated(conceptId).map((c) => c.name),
      studentLevel
    });
    return {
      name: data.name || concept.name,
      explanation: data.explanation || concept.explanation,
      keyPoints: data.keyPoints || concept.keyPoints || [],
      formula: data.formula || '',
      example: data.example || '',
      related: data.related || [],
      analogy: data.analogy || '',
      commonMistake: data.commonMistake || '',
      difficulty: concept.difficulty
    };
  }

  async generateQuiz({ map, conceptIds, count = 5 }) {
    const concepts = map.concepts
      .filter((c) => conceptIds.includes(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name,
        explanation: c.explanation,
        keyPoints: c.keyPoints,
        formula: c.formula
      }));
    const data = await chat('/quiz', { concepts, count });
    return (data.questions || []).map((q, i) => ({
      id: q.id || `q${i}-${Date.now()}`,
      type: q.type || 'multiple_choice',
      conceptId: q.conceptId || concepts[0]?.id || '',
      conceptName: q.conceptName || concepts[0]?.name || 'Concept',
      question: q.question || '',
      options: q.options || [],
      correctAnswer: q.correctAnswer ?? 0,
      explanation: q.explanation || ''
    }));
  }

  async evaluateAnswer({ question, answer }) {
    const data = await chat('/evaluate', {
      type: question.type,
      question: question.question,
      correctAnswer: question.correctAnswer,
      userAnswer: answer
    });
    return {
      correct: !!data.correct,
      explanation: data.explanation || ''
    };
  }

  async generateStudyPlan({ map, weakConcepts }) {
    const data = await chat('/study-plan', {
      weakConcepts: (weakConcepts || []).map((c) => ({ id: c.id, name: c.name }))
    });
    return {
      plan: data.plan || [],
      totalMinutes: data.totalMinutes || 0,
      tip: data.tip || ''
    };
  }

  async askQuestion({ map, conceptId, question }) {
    const concept = map.getConcept(conceptId);
    if (!concept) throw new Error('Concept not found');
    const data = await chat('/ask', {
      concept: concept.name,
      explanation: concept.explanation,
      question
    });
    return { answer: data.answer || '' };
  }
}