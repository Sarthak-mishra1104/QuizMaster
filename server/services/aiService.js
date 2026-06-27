const Groq = require("groq-sdk");
const { GoogleGenAI } = require("@google/genai");

// ======================================================
// Groq Client
// ======================================================

const getClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not configured in .env");
  }

  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
};

// ======================================================
// Gemini Client
// ======================================================

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured in .env");
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
};

// ======================================================
// Parse AI Response
// ======================================================

const parseAIResponse = (content, expected) => {
  let clean = String(content || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = clean.indexOf("[");
  const end = clean.lastIndexOf("]");

  if (start === -1 || end === -1) {
    throw new Error("No JSON array found in AI response");
  }

  clean = clean.substring(start, end + 1);

  let parsed;

  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("AI response is not an array");
  }

  const seen = new Set();

  const unique = parsed.filter((q) => {
    const key = q.question?.toLowerCase().trim();

    if (!key) return false;

    if (seen.has(key)) return false;

    seen.add(key);

    return true;
  });

  return unique.slice(0, expected).map((q, i) => {

    let options = Array.isArray(q.options)
      ? q.options.map(String)
      : [];

    const isPlaceholder = (opt) =>
      /^(option\s*[abcd]|choice\s*\d|[abcd])$/i.test(opt.trim());

    if (
      options.length !== 4 ||
      options.some(isPlaceholder)
    ) {
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
      correctAnswer:
        typeof q.correctAnswer === "number"
          ? q.correctAnswer % 4
          : 0,
      explanation: String(q.explanation || ""),
      difficulty: ["easy", "medium", "hard"].includes(q.difficulty)
        ? q.difficulty
        : "medium",
    };
  });
};

// ======================================================
// Similarity
// ======================================================

const similarity = (str1, str2) => {

  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;

  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));

  const intersection = new Set(
    [...words1].filter((w) => words2.has(w))
  );

  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
};

// ======================================================
// Difficulty Guide
// ======================================================

const difficultyGuide = {
  easy:
    "basic definitions, simple concepts, beginner level only",

  medium:
    "application of concepts, moderate complexity, intermediate level only",

  hard:
    "advanced analysis, complex scenarios, expert level only",

  mixed:
    "mix of beginner, intermediate and advanced concepts",
};
// ======================================================
// Prompt Builder
// ======================================================

const buildPrompt = (
  topic,
  count,
  difficulty,
  existingQuestions = []
) => {

  const existingList =
    existingQuestions.length > 0
      ? `

DO NOT REPEAT OR REPHRASE ANY OF THESE QUESTIONS:

${existingQuestions
  .map((q, i) => `${i + 1}. ${q.question}`)
  .join("\n")}`
      : "";

  return `Generate exactly ${count} UNIQUE multiple choice questions about "${topic}".

Difficulty: ${difficulty}
(${difficultyGuide[difficulty] || difficultyGuide.medium})

STRICT RULES

- Questions MUST match requested difficulty.
- Every question must test a DIFFERENT concept.
- No duplicate questions.
- No rephrased questions.
- Four meaningful answer choices.
- Do NOT use placeholder answers.
- correctAnswer must be index 0-3.
${existingList}

Return ONLY JSON.

[
{
"question":"",
"options":["","","",""],
"correctAnswer":0,
"explanation":"",
"difficulty":"${difficulty === "mixed" ? "medium" : difficulty}"
}
]`;
};

// ======================================================
// GROQ
// ======================================================

const generateBatch = async (
  client,
  topic,
  count,
  difficulty,
  existingQuestions = []
) => {

  const prompt = buildPrompt(
    topic,
    count,
    difficulty,
    existingQuestions
  );

  const response =
    await client.chat.completions.create({

      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.95,

      max_tokens: 4000,
    });

  return response.choices[0].message.content;
};

// ======================================================
// GEMINI
// ======================================================

const generateBatchGemini = async (
  topic,
  count,
  difficulty,
  existingQuestions = []
) => {

  const client = getGeminiClient();

  const prompt = buildPrompt(
    topic,
    count,
    difficulty,
    existingQuestions
  );

  const response =
    await client.models.generateContent({

      model: "gemini-2.5-flash",

      contents: prompt,
    });

  return response.text;
};

// ======================================================
// Auto Fallback
// ======================================================

const generateWithFallback = async (
  topic,
  count,
  difficulty,
  existingQuestions = []
) => {

  try {

    const groq = getClient();

    console.log("Using Groq...");

    return await generateBatch(
      groq,
      topic,
      count,
      difficulty,
      existingQuestions
    );

  } catch (err) {

    console.log(
      "Groq failed. Switching to Gemini..."
    );

    return await generateBatchGemini(
      topic,
      count,
      difficulty,
      existingQuestions
    );
  }
};


async function generateFromTopic({
  topic,
  numQuestions = 10,
  difficulty = "medium",
}) {
  let allQuestions = [];

  if (numQuestions <= 15) {
    const text = await generateWithFallback(
      topic,
      numQuestions,
      difficulty
    );

    allQuestions = parseAIResponse(text, numQuestions);
  } else {
    const batchSize = 10;
    const batches = Math.ceil(numQuestions / batchSize);

    for (let i = 0; i < batches; i++) {
      const remaining = numQuestions - allQuestions.length;
      const count = Math.min(batchSize, remaining);

      try {
        const text = await generateWithFallback(
          topic,
          count,
          difficulty,
          allQuestions
        );

        const batch = parseAIResponse(text, count);

        const newQuestions = batch.filter((newQ) => {
          const newKey = newQ.question.toLowerCase().trim();

          return !allQuestions.some(
            (existing) =>
              existing.question.toLowerCase().trim() === newKey ||
              similarity(existing.question, newQ.question) > 0.7
          );
        });

        allQuestions.push(...newQuestions);

        if (allQuestions.length >= numQuestions) {
          break;
        }

        if (i < batches - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, 500)
          );
        }
      } catch (err) {
        console.error(
          `Batch ${i + 1} failed:`,
          err.message
        );
      }
    }
  }

  return allQuestions.slice(0, numQuestions);
}

async function generateFromPDF({
  pdfText,
  numQuestions = 10,
  difficulty = "medium",
}) {

  const truncatedText =
    pdfText.length > 6000
      ? pdfText.substring(0, 6000)
      : pdfText;

  const prompt = `Based on this document, generate exactly ${numQuestions} UNIQUE multiple choice questions.

Difficulty: ${difficulty}

STRICT RULES

- Every question must test a DIFFERENT concept.
- No duplicate questions.
- No rephrased questions.
- Four meaningful answer choices.
- correctAnswer must be index 0-3.

DOCUMENT

"""
${truncatedText}
"""

Return ONLY JSON.

[
{
"question":"",
"options":["","","",""],
"correctAnswer":0,
"explanation":"",
"difficulty":"${difficulty}"
}
]`;

  let text;

  try {

    console.log("Generating PDF quiz using Groq...");

    const groq = getClient();

    const response =
      await groq.chat.completions.create({

        model: "llama-3.3-70b-versatile",

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],

        temperature: 0.8,

        max_tokens: 4000,
      });

    text = response.choices[0].message.content;

  } catch (err) {

    console.log(
      "Groq PDF generation failed. Using Gemini..."
    );

    const gemini = getGeminiClient();

    const response =
      await gemini.models.generateContent({

        model: "gemini-2.5-flash",

        contents: prompt,
      });

    text = response.text;
  }

  return parseAIResponse(text, numQuestions);
}

module.exports = { generateFromTopic, generateFromPDF };