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

  return parsed.slice(0, expected).map((q, i) => {
    // Validate options are real strings not placeholders
    let options = Array.isArray(q.options) ? q.options.map(String) : [];
    
    // Filter out placeholder options like "Option A", "A", etc
    const isPlaceholder = (opt) => /^(option\s*[abcd]|[abcd])$/i.test(opt.trim());
    
    if (options.length !== 4 || options.some(isPlaceholder)) {
      // Try to extract options from alternative formats
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

async function generateFromTopic({ topic, numQuestions = 10, difficulty = 'medium' }) {
  const client = getClient();

  const prompt = `Generate exactly ${numQuestions} multiple choice quiz questions about "${topic}" with ${difficulty} difficulty.

IMPORTANT: Return ONLY a valid JSON array. No markdown, no explanation text.

Each question must follow this EXACT format:
[
  {
    "question": "What is the capital of France?",
    "options": ["Paris", "London", "Berlin", "Madrid"],
    "correctAnswer": 0,
    "explanation": "Paris is the capital and largest city of France.",
    "difficulty": "${difficulty}"
  }
]

Rules:
- options array must have exactly 4 real answer choices (NOT "Option A", "Option B" etc)
- correctAnswer is the index (0, 1, 2, or 3) of the correct option
- All options must be meaningful and specific
- Questions must be unique`;

  const response = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 4000,
  });

  const text = response.choices[0].message.content;
  return parseAIResponse(text, numQuestions);
}

async function generateFromPDF({ pdfText, numQuestions = 10, difficulty = 'medium' }) {
  const client = getClient();
  const truncatedText = pdfText.length > 6000 ? pdfText.substring(0, 6000) : pdfText;

  const prompt = `Based on the following document, generate exactly ${numQuestions} multiple choice quiz questions with ${difficulty} difficulty.

DOCUMENT:
"""
${truncatedText}
"""

IMPORTANT: Return ONLY a valid JSON array. No markdown, no explanation text.

Each question must follow this EXACT format:
[
  {
    "question": "What is discussed in the document?",
    "options": ["Real answer 1", "Real answer 2", "Real answer 3", "Real answer 4"],
    "correctAnswer": 0,
    "explanation": "Brief explanation here.",
    "difficulty": "${difficulty}"
  }
]

Rules:
- options must have exactly 4 real meaningful answer choices
- correctAnswer is the index (0, 1, 2, or 3) of the correct option
- Do NOT use placeholder text like "Option A" or "Choice 1"`;

  const response = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 4000,
  });

  const text = response.choices[0].message.content;
  return parseAIResponse(text, numQuestions);
}

module.exports = { generateFromTopic, generateFromPDF };