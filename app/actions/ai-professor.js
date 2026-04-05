"use server"

/**
 * AI Professor — generates a fully structured course as strict JSON.
 *
 * Returned shape (parsed JSON object):
 * {
 *   courseTitle:    string,
 *   fiveDayOutline: string[5],          // one sentence per day
 *   quizzes: {                          // keyed 1-5 (day number)
 *     [1-5]: [
 *       { prompt: string, options: string[3], correctIndex: number }
 *     ]
 *   },
 *   finalChallenge: string
 * }
 *
 * On success returns { ok: true, data: <parsed object> }.
 * On failure returns { ok: false, error: string }.
 */
export async function generateCourse(formData) {
  const topic = formData.get("topic")
  const difficulty = formData.get("difficulty")

  if (!process.env.OPENROUTER_API_KEY) {
    return { ok: false, error: "OPENROUTER_API_KEY is not configured." }
  }

  if (!topic || !topic.trim()) {
    return { ok: false, error: "Please provide a course topic." }
  }

  const systemPrompt = `You are a world-class AI Professor. Your ONLY output is a single valid JSON object — no markdown fences, no commentary, no trailing text.

The JSON must match this exact schema:
{
  "courseTitle": "<string>",
  "fiveDayOutline": ["<day1 summary>", "<day2 summary>", "<day3 summary>", "<day4 summary>", "<day5 summary>"],
  "quizzes": {
    "1": [
      { "prompt": "<question>", "options": ["<A>", "<B>", "<C>"], "correctIndex": <0|1|2> },
      { "prompt": "<question>", "options": ["<A>", "<B>", "<C>"], "correctIndex": <0|1|2> },
      { "prompt": "<question>", "options": ["<A>", "<B>", "<C>"], "correctIndex": <0|1|2> }
    ],
    "2": [ ...3 questions... ],
    "3": [ ...3 questions... ],
    "4": [ ...3 questions... ],
    "5": [ ...3 questions... ]
  },
  "finalChallenge": "<string>"
}

Rules:
- fiveDayOutline must have exactly 5 elements.
- Each quiz day must have exactly 3 questions.
- Each question must have exactly 3 options and a correctIndex of 0, 1, or 2.
- Output ONLY the JSON object. No code fences. No extra keys.`

  let response
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Create a ${difficulty} level 5-day course on the topic: "${topic}".`,
          },
        ],
      }),
    })
  } catch (err) {
    return { ok: false, error: `Failed to reach the AI service. ${err.message}` }
  }

  if (!response.ok) {
    let detail = ""
    try {
      const errData = await response.json()
      detail = errData?.error?.message || JSON.stringify(errData)
    } catch {
      detail = await response.text()
    }
    return { ok: false, error: `OpenRouter returned ${response.status}. ${detail}` }
  }

  let apiData
  try {
    apiData = await response.json()
  } catch {
    return { ok: false, error: "Could not parse the AI API response." }
  }

  const raw = apiData?.choices?.[0]?.message?.content
  if (!raw) {
    return { ok: false, error: "No content returned from the AI." }
  }

  // Strip optional markdown fences the model may include despite instructions
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()

  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    return { ok: false, error: `AI response was not valid JSON. Raw output: ${raw.slice(0, 300)}` }
  }

  // Validate required top-level fields
  if (
    typeof parsed.courseTitle !== "string" ||
    !Array.isArray(parsed.fiveDayOutline) ||
    parsed.fiveDayOutline.length !== 5 ||
    typeof parsed.quizzes !== "object" ||
    typeof parsed.finalChallenge !== "string"
  ) {
    return { ok: false, error: "AI returned JSON with an unexpected structure." }
  }

  return { ok: true, data: parsed }
}
