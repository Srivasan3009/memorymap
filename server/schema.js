// Shared JSON schemas/prompts for the real AI providers (server-side).
// The model is told exactly what shape to emit, so the client can consume it
// without post-processing.

export function schemaFor(endpoint) {
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
  "explanation": "string — clear, level-appropriate explanation",
  "analogy": "string — a relatable analogy",
  "keyPoints": ["string"],
  "formula": "string or empty",
  "example": "string — worked example",
  "relatedConcepts": ["string"],
  "commonMistakes": ["string"]
}
Output ONLY the JSON object.`,
    '/quiz': `Return a JSON object with EXACTLY these fields:
{
  "questions": [
    {
      "id": "string unique",
      "conceptId": "string — concept the question targets",
      "type": "multiple_choice | true_false | short_answer",
      "prompt": "string — the question",
      "options": ["string"] or [],
      "correctAnswer": "string",
      "explanation": "string — why this is correct",
      "difficulty": 1
    }
  ]
}
Generate diverse, genuinely useful questions that test understanding of the given concepts. Output ONLY the JSON object.`,
    '/evaluate': `Return a JSON object with EXACTLY these fields:
{
  "correct": true,
  "score": 0.0,
  "feedback": "string — specific, encouraging feedback"
}
score is 0.0-1.0. For short answers judge semantic correctness, not exact wording. Output ONLY the JSON object.`,
    '/study-plan': `Return a JSON object with EXACTLY these fields:
{
  "summary": "string — overview of the plan",
  "sessions": [
    {
      "day": 1,
      "focus": "string",
      "concepts": ["string"],
      "durationMinutes": 30,
      "activities": ["string"]
    }
  ]
}
Build a realistic, spaced study plan targeting the weak concepts first. Output ONLY the JSON object.`,
    '/ask': `Return a JSON object with EXACTLY these fields:
{
  "answer": "string — direct, helpful answer"
}
Output ONLY the JSON object.`
  };
  return schemas[endpoint];
}