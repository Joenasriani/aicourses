"use server"

import { logger } from "@/app/lib/logger"

/**
 * AI Professor — generates a fully structured course as strict JSON.
 *
 * Returned shape (parsed JSON object):
 * {
 *   courseTitle:    string,
 *   fiveDayOutline: string[5],          // one sentence per day
 *   practicalActionPrompts: string[5],  // one actionable prompt per day (e.g. "Go to ChatGPT and try…")
 *   quizzes: {                          // keyed 1-5 (day number)
 *     [1-5]: [
 *       { prompt: string, options: string[3], correctIndex: number }
 *     ]
 *   },
 *   finalChallenge: string              // cross-day challenge combining all 5 days' skills
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

  logger.info("ai.professor.start", { topic, difficulty })

  const start = Date.now()
  const systemPrompt = `You are a world-class AI Professor. Your ONLY output is a single valid JSON object — no markdown fences, no commentary, no trailing text.

The JSON must match this exact schema:
{
  "courseTitle": "<string>",
  "fiveDayOutline": ["<day1 summary>", "<day2 summary>", "<day3 summary>", "<day4 summary>", "<day5 summary>"],
  "practicalActionPrompts": [
    "<Day 1 action, e.g. 'Go to ChatGPT and try…'>",
    "<Day 2 action>",
    "<Day 3 action>",
    "<Day 4 action>",
    "<Day 5 action>"
  ],
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
  "finalChallenge": "<A single capstone challenge that REQUIRES combining skills from ALL 5 days — explicitly reference each day's skill>"
}

Rules:
- fiveDayOutline must have exactly 5 elements.
- practicalActionPrompts must have exactly 5 elements, one per day. Each must start with an action verb (e.g. "Open", "Go to", "Try", "Create") and describe a hands-on exercise the learner can do immediately.
- Each quiz day must have exactly 3 questions.
- Each question must have exactly 3 options and a correctIndex of 0, 1, or 2.
- finalChallenge must explicitly reference each of the 5 days and require learners to combine all the skills taught across the full course.
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
    logger.error("ai.professor.fetch_failed", { topic, durationMs: Date.now() - start, error: err.message })
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
    logger.warn("ai.professor.api_error", { topic, durationMs: Date.now() - start, status: response.status })
    return { ok: false, error: `OpenRouter returned ${response.status}. ${detail}` }
  }

  let apiData
  try {
    apiData = await response.json()
  } catch {
    logger.error("ai.professor.parse_error", { topic, durationMs: Date.now() - start })
    return { ok: false, error: "Could not parse the AI API response." }
  }

  const raw = apiData?.choices?.[0]?.message?.content
  if (!raw) {
    logger.warn("ai.professor.no_content", { topic, durationMs: Date.now() - start })
    return { ok: false, error: "No content returned from the AI." }
  }

  // Strip optional markdown fences the model may include despite instructions
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()

  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    logger.warn("ai.professor.invalid_json", { topic, durationMs: Date.now() - start })
    return { ok: false, error: `AI response was not valid JSON. Raw output: ${raw.slice(0, 300)}` }
  }

  // Validate required top-level fields
  if (
    typeof parsed.courseTitle !== "string" ||
    !Array.isArray(parsed.fiveDayOutline) ||
    parsed.fiveDayOutline.length !== 5 ||
    !Array.isArray(parsed.practicalActionPrompts) ||
    parsed.practicalActionPrompts.length !== 5 ||
    typeof parsed.quizzes !== "object" ||
    typeof parsed.finalChallenge !== "string"
  ) {
    logger.warn("ai.professor.invalid_structure", { topic, durationMs: Date.now() - start })
    return { ok: false, error: "AI returned JSON with an unexpected structure." }
  }

  logger.info("ai.professor.success", { topic, difficulty, durationMs: Date.now() - start })
  return { ok: true, data: parsed }
}
