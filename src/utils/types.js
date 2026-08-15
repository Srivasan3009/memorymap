// Core domain types shared across the app.

export const CONCEPT_CATEGORIES = {
  ROOT: 'root',
  MAJOR: 'major',
  MINOR: 'minor',
  DETAIL: 'detail'
};

export const QUIZ_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  SHORT_ANSWER: 'short_answer'
};

/**
 * A single concept node in the knowledge graph.
 */
export class Concept {
  constructor({
    id,
    name,
    category = CONCEPT_CATEGORIES.MINOR,
    explanation = '',
    keyPoints = [],
    formula = '',
    example = '',
    difficulty = 1,
    subject = '',
    tags = []
  }) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.explanation = explanation;
    this.keyPoints = keyPoints;
    this.formula = formula;
    this.example = example;
    this.difficulty = difficulty;
    this.subject = subject;
    this.tags = tags;
  }
}

/**
 * An edge between two concepts.
 */
export class Relationship {
  constructor({ id, source, target, label = '' }) {
    this.id = id;
    this.source = source;
    this.target = target;
    this.label = label;
  }
}

/**
 * A complete knowledge map produced by the AI service.
 */
export class KnowledgeMap {
  constructor({ id, title, subject = '', source = 'custom', concepts = [], relationships = [], createdAt = Date.now(), mastery = {} }) {
    this.id = id;
    this.title = title;
    this.subject = subject;
    this.source = source;
    this.concepts = concepts;
    this.relationships = relationships;
    this.createdAt = createdAt;
    this.mastery = mastery;
  }

  getConcept(id) {
    return this.concepts.find((c) => c.id === id);
  }

  getChildren(conceptId) {
    return this.relationships
      .filter((r) => r.source === conceptId)
      .map((r) => this.getConcept(r.target))
      .filter(Boolean);
  }

  getRelated(conceptId) {
    const ids = new Set();
    this.relationships.forEach((r) => {
      if (r.source === conceptId) ids.add(r.target);
      if (r.target === conceptId) ids.add(r.source);
    });
    return this.concepts.filter((c) => ids.has(c.id));
  }
}

export function masteryFor(map, conceptId) {
  return map.mastery?.[conceptId] || 'unknown';
}

export function setMastery(map, conceptId, level) {
  const next = { ...map.mastery, [conceptId]: level };
  return new KnowledgeMap({ ...map, mastery: next });
}