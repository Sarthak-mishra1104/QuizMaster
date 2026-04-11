const Groq = require('groq-sdk');

const getClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured in .env');
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const parseAIResponse = (content, expected) => {
  let clean = content
    .replace(/```json/g, '')
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

  return parsed.slice(0, expected).map((q, i) => ({
    question: String(q.question || `Question ${i + 1}`),
    options: Array.isArray(q.options) && q.options.length === 4
      ? q.options.map(String)
      : ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer % 4 : 0,
    explanation: String(q.explanation || ''),
    difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
  }));
};

async function generateFromTopic({ topic, numQuestions = 10, difficulty = 'medium' }) {
  const client = getClient();

  const prompt = `Create exactly ${numQuestions} multiple choice questions about "${topic}" with difficulty "${difficulty}". Return ONLY a JSON array like this: [{"question":"What is X?","options":["A","B","C","D"],"correctAnswer":0,"explanation":"Because...","difficulty":"${difficulty}"}]`;

  const response = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'user',
        content: prompt,
      }
    ],
    temperature: 0.5,
    max_tokens: 4000,
  });

  const text = response.choices[0].message.content;
  return parseAIResponse(text, numQuestions);
}

async function generateFromPDF({ pdfText, numQuestions = 10, difficulty = 'medium' }) {
  const client = getClient();
  const truncatedText = pdfText.length > 6000 ? pdfText.substring(0, 6000) : pdfText;

  const prompt = `Based on this document, create exactly ${numQuestions} multiple choice questions with difficulty "${difficulty}". Document: """${truncatedText}""". Return ONLY a JSON array: [{"question":"What is X?","options":["A","B","C","D"],"correctAnswer":0,"explanation":"Because...","difficulty":"${difficulty}"}]`;

  const response = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'user',
        content: prompt,
      }
    ],
    temperature: 0.5,
    max_tokens: 4000,
  });

  const text = response.choices[0].message.content;
  return parseAIResponse(text, numQuestions);
}

module.exports = { generateFromTopic, generateFromPDF };