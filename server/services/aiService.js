const Groq = require('groq-sdk');

const getClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured in .env');
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const parseAIResponse = (content, expected) => {
  let clean = content
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const start = clean.indexOf('[');
  const end = clean.lastIndexOf(']');
  if (start === -1 || end === -1) throw new Error('No JSON array found in response');
  clean = clean.substring(start, end + 1);

  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error('AI returned invalid JSON');
  }

  if (!Array.isArray(parsed)) throw new Error('AI response is not an array');

  const seen = new Set();
  const unique = parsed.filter(q => {
    const key = q.question?.toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.slice(0, expected).map((q, i) => {
    let options = Array.isArray(q.options) ? q.options.map(String) : [];
    const isPlaceholder = (opt) => /^(option\s*[abcd]|[abcd]|choice\s*\d)$/i.test(opt.trim());
    if (options.length !== 4 || options.some(isPlaceholder)) {
      options = [
        q.option_a || q.optionA || q.a || options[0] || `Choice ${i}A`,
        q.option_b || q.optionB || q.b || options[1] || `Choice ${i}B`,
        q.option_c || q.optionC || q.c || options[2] || `Choice ${i}C`,
        q.option_d || q.optionD || q.d || options[3] || `Choice ${i}D`,
      ].map(String);
    }

    return {
      question: String(q.question || `Question ${i + 1}`),
      options,
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer % 4 : 0,
      explanation: String(q.explanation || ''),
      difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
    };
  });
};

const similarity = (str1, str2) => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1;
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  return intersection.size / union.size;
};

const difficultyGuide = {
  easy: 'basic definitions, simple concepts, beginner level only',
  medium: 'application of concepts, moderate complexity, intermediate level only',
  hard: 'advanced analysis, complex scenarios, expert level only',
  mixed: 'mix of basic, intermediate and advanced concepts',
};

const generateBatch = async (client, topic, count, difficulty, existingQuestions = []) => {
  const existingList = existingQuestions.length > 0
    ? `\n\nDO NOT REPEAT OR REPHRASE ANY OF THESE QUESTIONS:\n${existingQuestions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}`
    : '';

  const prompt = `Generate exactly ${count} UNIQUE multiple choice questions about "${topic}".
Difficulty: ${difficulty} — ${difficultyGuide[difficulty] || difficultyGuide.medium}

STRICT RULES:
- Questions MUST match ${difficulty} difficulty level exactly
- Every question MUST test a completely DIFFERENT concept
- No duplicate, similar or rephrased questions allowed
- 4 real specific answer choices per question
- Do NOT use "Option A", "Choice 1" or placeholder options
- correctAnswer is index 0-3${existingList}

Return ONLY a valid JSON array:
[
  {
    "question": "Specific unique question testing one distinct concept?",
    "options": ["Real answer 1", "Real answer 2", "Real answer 3", "Real answer 4"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this is correct",
    "difficulty": "${difficulty === 'mixed' ? 'medium' : difficulty}"
  }
]`;

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.95,
    max_tokens: 4000,
  });

  return response.choices[0].message.content;
};

async function generateFromTopic({ topic, numQuestions = 10, difficulty = 'medium' }) {
  const client = getClient();
  let allQuestions = [];

  if (numQuestions <= 15) {
    const text = await generateBatch(client, topic, numQuestions, difficulty);
    allQuestions = parseAIResponse(text, numQuestions);
  } else {
    const batchSize = 10;
    const batches = Math.ceil(numQuestions / batchSize);

    for (let i = 0; i < batches; i++) {
      const remaining = numQuestions - allQuestions.length;
      const count = Math.min(batchSize, remaining);

      try {
        const text = await generateBatch(client, topic, count, difficulty, allQuestions);
        const batch = parseAIResponse(text, count);

        const newQuestions = batch.filter(newQ => {
          const newKey = newQ.question.toLowerCase().trim();
          return !allQuestions.some(existing =>
            existing.question.toLowerCase().trim() === newKey ||
            similarity(existing.question, newQ.question) > 0.7
          );
        });

        allQuestions = [...allQuestions, ...newQuestions];
        if (allQuestions.length >= numQuestions) break;
        if (i < batches - 1) await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        console.error(`Batch ${i + 1} failed:`, err.message);
        break;
      }
    }
  }

  return allQuestions.slice(0, numQuestions);
}

async function generateFromPDF({ pdfText, numQuestions = 10, difficulty = 'medium' }) {
  const client = getClient();
  const truncatedText = pdfText.length > 6000 ? pdfText.substring(0, 6000) : pdfText;

  const prompt = `Based on this document, generate exactly ${numQuestions} UNIQUE multiple choice questions with ${difficulty} difficulty.

STRICT RULES:
- Every question MUST cover a completely DIFFERENT concept from the document
- No duplicate, similar or rephrased questions
- Questions must match ${difficulty} difficulty level
- 4 real meaningful answer choices per question
- correctAnswer is index 0-3

DOCUMENT:
"""
${truncatedText}
"""

Return ONLY a valid JSON array:
[
  {
    "question": "Specific question about a distinct concept?",
    "options": ["Real answer 1", "Real answer 2", "Real answer 3", "Real answer 4"],
    "correctAnswer": 0,
    "explanation": "Brief explanation",
    "difficulty": "${difficulty}"
  }
]`;

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 4000,
  });

  const text = response.choices[0].message.content;
  return parseAIResponse(text, numQuestions);
}

module.exports = { generateFromTopic, generateFromPDF };