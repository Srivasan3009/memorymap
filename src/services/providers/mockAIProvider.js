import { buildDemoMap, concepts as demoConcepts } from '../../data/demoData.js';
import { quizBank, conceptDeepDives } from '../../data/quizBank.js';
import { KnowledgeMap, Concept, Relationship, CONCEPT_CATEGORIES as C, QUIZ_TYPES as T } from '../../utils/types.js';
import { MASTERY_LEVELS as M } from '../../utils/mastery.js';

// Mock AI provider. Generates believable content locally so the entire product
// works with zero configuration — ideal for demos, hackathons, and offline dev.
//
// It uses the rich Electrostatics dataset when the topic matches, and falls
// back to a lightweight generative approach for arbitrary topics.

function normalizeTopic(text) {
  return (text || '').toLowerCase();
}

const DEMO_KEYWORDS = ['electro', 'static', 'physics', 'charge', 'electric'];

function looksLikeDemo(topic) {
  const t = normalizeTopic(topic);
  return DEMO_KEYWORDS.some((k) => t.includes(k));
}

// ── Generic topic scaffolding ──────────────────────────────────────────────

function genericConceptsFor(topic) {
  const clean = (topic || 'Introduction to a New Topic').trim();
  const title = clean.length > 60 ? clean.slice(0, 60) + '…' : clean;

  const root = new Concept({
    id: 'root', name: title, category: C.ROOT, subject: topic,
    explanation: `${clean} is the central topic of this study map. Explore its connected concepts below to build a full understanding.`,
    keyPoints: ['This is the root of your knowledge map.', 'Each branch below covers one core idea.']
  });

  const definitions = new Concept({
    id: 'definitions', name: 'Key Definitions', category: C.MAJOR, subject: topic,
    explanation: `The essential terms and definitions that underpin ${clean}. Learn these first — every other concept builds on them.`,
    keyPoints: ['Start here for vocabulary.', 'Definitions anchor the rest of the map.']
  });

  const principles = new Concept({
    id: 'principles', name: 'Core Principles', category: C.MAJOR, subject: topic,
    explanation: `The fundamental rules and principles of ${clean}. Understanding these lets you reason about new situations.`,
    keyPoints: ['Principles explain why things work.', 'Apply them to solve problems.']
  });

  const applications = new Concept({
    id: 'applications', name: 'Applications', category: C.MAJOR, subject: topic,
    explanation: `Real-world uses of ${clean}. Connecting theory to practice makes learning stick.`,
    keyPoints: ['Where is this used in real life?', 'Applications reinforce memory.']
  });

  const examples = new Concept({
    id: 'examples', name: 'Worked Examples', category: C.MINOR, subject: topic,
    explanation: 'Step-by-step examples that show the principles in action.',
    keyPoints: ['Follow each step carefully.', 'Try to predict the next step.']
  });

  return [root, definitions, principles, applications, examples];
}

function genericRelationships(concepts) {
  const r = [];
  for (let i = 1; i < concepts.length; i++) {
    r.push(new Relationship({ id: `gr${i}`, source: concepts[0].id, target: concepts[i].id, label: 'includes' }));
  }
  r.push(new Relationship({ id: 'grx', source: 'principles', target: 'examples', label: 'demonstrated by' }));
  return r;
}

// ── Public interface ───────────────────────────────────────────────────────

export class MockAIProvider {
  async generateKnowledgeMap(input) {
    await delay(1600);

    const topic = (input.topic || input.text || '').trim();
    if (looksLikeDemo(topic)) {
      return buildDemoMap();
    }
    if (topic) {
      const concepts = genericConceptsFor(topic);
      const relationships = genericRelationships(concepts);
      return new KnowledgeMap({
        id: `map-${Date.now()}`,
        title: topic.length > 40 ? topic.slice(0, 40) + '…' : topic,
        subject: 'Custom',
        source: 'ai',
        concepts,
        relationships,
        createdAt: Date.now(),
        mastery: {}
      });
    }
    // No input → default to demo
    return buildDemoMap();
  }

  async explainConcept({ map, conceptId, studentLevel = 'beginner' }) {
    await delay(700);
    const concept = map.getConcept(conceptId);
    if (!concept) throw new Error('Concept not found');

    const depth = conceptDeepDives[conceptId] || {};
    const points = Array.isArray(concept.keyPoints) && concept.keyPoints.length
      ? concept.keyPoints
      : ['This concept is a core idea in the topic.'];
    const example = concept.example || depth.analogy || 'A practical example connects this idea to everyday life.';
    const formula = concept.formula || '';
    const related = map.getRelated(conceptId).map((c) => c.name);

    return {
      name: concept.name,
      explanation: concept.explanation,
      keyPoints: points,
      formula,
      example,
      related,
      analogy: depth.analogy || '',
      commonMistake: depth.commonMistake || '',
      difficulty: concept.difficulty,
      mastery: map.mastery?.[conceptId] || M.UNKNOWN
    };
  }

  async generateQuiz({ map, conceptIds, count = 5 }) {
    await delay(1100);

    // Prefer the curated question bank; fall back to generated questions.
    const pool = [];
    for (const id of conceptIds) {
      pool.push(...quizBank.filter((q) => q.conceptId === id));
    }
    // Also add bank questions for concepts whose ids differ.
    if (pool.length < count) {
      for (const q of quizBank) {
        if (!conceptIds.includes(q.conceptId) && map.getConcept(q.conceptId)) {
          pool.push(q);
        }
      }
    }
    if (!pool.length) {
      // Generate from concepts.
      return map.concepts.slice(0, count).map((c) => makeQuestionFromConcept(c));
    }

    const shuffled = shuffle(pool);
    const chosen = shuffled.slice(0, Math.min(count, shuffled.length));
    const questions = chosen.map((q, i) => ({
      id: `q${i}-${Date.now()}`,
      type: q.type,
      conceptId: q.conceptId,
      conceptName: map.getConcept(q.conceptId)?.name || 'Concept',
      question: q.question,
      options: q.options || [],
      correctAnswer: q.answer,
      explanation: q.explanation || ''
    }));

    // Ensure a good mix of question types where possible.
    return questions;
  }

  async evaluateAnswer({ question, answer }) {
    await delay(400);

    if (question.type === T.SHORT_ANSWER) {
      const correct = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer];
      const user = String(answer || '').toLowerCase().trim();
      const accepted = correct.some((c) => {
        const norm = String(c).toLowerCase().trim();
        return norm === user || norm.includes(user) || user.includes(norm);
      });
      return { correct: accepted, explanation: question.explanation || '' };
    }

    const idx = Number(answer);
    return {
      correct: idx === question.correctAnswer,
      explanation: question.explanation || ''
    };
  }

  async generateStudyPlan({ map, weakConcepts }) {
    await delay(800);
    const weak = (weakConcepts || []).slice(0, 5);

    const steps = weak.map((c, i) => ({
      conceptId: c.id,
      title: `Review ${c.name}`,
      description: `Re-read the key points and example for ${c.name}, then explain it aloud in your own words.`,
      duration: `${6 + i * 2} min`,
      action: 'review'
    }));

    steps.push({
      conceptId: null,
      title: 'Consolidation quiz',
      description: 'Take a practice quiz on the concepts you just reviewed to lock them into memory.',
      duration: '10 min',
      action: 'quiz'
    });

    return {
      plan: steps,
      totalMinutes: steps.reduce((sum, s) => sum + parseInt(s.duration), 0),
      tip: 'Spaced repetition beats cramming. Return to weak concepts tomorrow for a quick recall check.'
    };
  }

  async askQuestion({ map, conceptId, question }) {
    await delay(900);
    const concept = map.getConcept(conceptId);
    if (!concept) throw new Error('Concept not found');

    const q = normalizeTopic(question);
    let answer;

    if (/(why|explain|what is|meaning)/.test(q)) {
      answer = `${concept.name}: ${concept.explanation} ${concept.example ? 'Example: ' + concept.example : ''}`;
    } else if (/(formula|equation|calculate)/.test(q) && concept.formula) {
      answer = `The key formula for ${concept.name} is:\n${concept.formula}\n\nApply it by substituting the known values and solving for the unknown.`;
    } else if (/(example|real.world|application)/.test(q)) {
      answer = concept.example || concept.explanation;
    } else if (/(related|connect|link)/.test(q)) {
      const related = map.getRelated(conceptId).map((c) => c.name);
      answer = `${concept.name} connects to: ${related.join(', ') || 'nothing directly'}. Explore these nodes to see how they fit together.`;
    } else {
      answer = `Here's a helpful way to think about ${concept.name}: ${concept.explanation}\n\nKeep going — try asking about a formula, an example, or a related concept!`;
    }

    return { answer };
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeQuestionFromConcept(c) {
  const types = [T.MULTIPLE_CHOICE, T.TRUE_FALSE];
  const type = types[Math.floor(Math.random() * types.length)];
  const points = (c.keyPoints || [c.explanation]).filter(Boolean);
  const fact = points[Math.floor(Math.random() * points.length)] || c.explanation;

  if (type === T.TRUE_FALSE) {
    return {
      id: `gen-${c.id}-${Date.now()}`,
      type,
      conceptId: c.id,
      conceptName: c.name,
      question: `Which statement is TRUE about ${c.name}?`,
      options: ['True', 'False'],
      correctAnswer: 0,
      explanation: fact
    };
  }
  const decoys = [c.explanation.slice(0, 60), 'None of the above', 'The opposite is true'].filter((d, i, arr) => arr.indexOf(d) === i);
  const options = [fact, ...decoys].slice(0, 4);
  return {
    id: `gen-${c.id}-${Date.now()}`,
    type,
    conceptId: c.id,
    conceptName: c.name,
    question: `What is a key point about ${c.name}?`,
    options,
    correctAnswer: 0,
    explanation: fact
  };
}

export function buildMockMapForTopic(topic) {
  return new MockAIProvider().generateKnowledgeMap({ topic });
}

export { buildDemoMap as buildDemoMapDirect };