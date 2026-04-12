"use server"

import { logger } from "@/app/lib/logger"

/**
 * Quiz Engine — generates 3 dynamic quiz questions from lesson content.
 *
 * Question types (one of each, in order):
 *   1. multiple_choice  — 3 options + correctIndex
 *   2. true_false       — options exactly ["True","False"] + correctIndex
 *   3. fix_the_prompt   — flawed AI prompt shown; user picks the best fix from 3 options
 *
 * Returns { ok: true, questions } or { ok: false, error }.
 *
 * @param {string|string[]} lessonContent - Lesson text(s) for the day
 * @param {string}          dayTitle      - Day/module title for context
 * @param {string[]}        usedPrompts   - Previously asked question prompts (to avoid repeats)
 */
export async function generateQuizQuestions(lessonContent, dayTitle, usedPrompts = []) {
  if (!process.env.OPENROUTER_API_KEY) {
    return { ok: false, error: "OPENROUTER_API_KEY is not configured." }
  }

  const text = Array.isArray(lessonContent)
    ? lessonContent.join("\n\n")
    : String(lessonContent || "")

  if (!text.trim()) {
    return { ok: false, error: "No lesson content provided." }
  }

  logger.info("ai.quiz.start", { dayTitle, textLength: text.length, usedPrompts: usedPrompts.length })
  const start = Date.now()

  const avoidClause =
    usedPrompts.length > 0
      ? `\nDo NOT reuse or closely echo these previously asked question prompts: ${JSON.stringify(
          usedPrompts.slice(0, 5),
        )}`
      : ""

  const systemPrompt = `You are a quiz generator for an AI learning platform. Given lesson content, output EXACTLY 3 quiz questions as a JSON array. No markdown fences, no commentary — JSON only.

Required types (one of each, in this exact order):
1. "multiple_choice"  — 3 answer options, one is correct
2. "true_false"       — options MUST be exactly ["True", "False"]
3. "fix_the_prompt"   — show a flawed AI prompt; offer 3 options (best corrected version + 2 worse/wrong versions); user picks the best

Schema:
[
  { "type": "multiple_choice", "prompt": "...", "options": ["A","B","C"], "correctIndex": 0 },
  { "type": "true_false",      "prompt": "...", "options": ["True","False"], "correctIndex": 0 },
  { "type": "fix_the_prompt",  "prompt": "Which AI prompt is the BEST version? Flawed original: '<flawed prompt>'", "options": ["<corrected best>","<still flawed>","<unrelated wrong>"], "correctIndex": 0 }
]

Rules:
- correctIndex is 0-based and must match the correct option.
- All questions must be directly relevant to the lesson content.
- For fix_the_prompt, place the CORRECT (best) version at the correctIndex position.${avoidClause}`

  let response
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate 3 quiz questions for this lesson about "${dayTitle || "AI"}":\n\n${text.slice(0, 1500)}`,
          },
        ],
        max_tokens: 900,
      }),
    })
  } catch (err) {
    logger.error("ai.quiz.fetch_failed", { dayTitle, durationMs: Date.now() - start, error: err.message })
    return { ok: false, error: `Failed to reach the AI service. ${err.message}` }
  }

  if (!response.ok) {
    let detail = ""
    try {
      const errData = await response.json()
      detail = errData?.error?.message || ""
    } catch {
      // ignore
    }
    logger.warn("ai.quiz.api_error", { dayTitle, durationMs: Date.now() - start, status: response.status })
    return { ok: false, error: `AI service returned ${response.status}. ${detail}` }
  }

  let apiData
  try {
    apiData = await response.json()
  } catch {
    logger.error("ai.quiz.parse_error", { dayTitle, durationMs: Date.now() - start })
    return { ok: false, error: "Could not parse the AI API response." }
  }

  const raw = apiData?.choices?.[0]?.message?.content
  if (!raw) {
    logger.warn("ai.quiz.no_content", { dayTitle, durationMs: Date.now() - start })
    return { ok: false, error: "No content returned from the AI." }
  }

  // Strip any markdown fences the model might include despite instructions
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()

  let questions
  try {
    questions = JSON.parse(cleaned)
  } catch {
    logger.warn("ai.quiz.invalid_json", { dayTitle, durationMs: Date.now() - start })
    return { ok: false, error: `AI response was not valid JSON. Raw: ${raw.slice(0, 200)}` }
  }

  if (!Array.isArray(questions) || questions.length < 1) {
    logger.warn("ai.quiz.invalid_array", { dayTitle, durationMs: Date.now() - start })
    return { ok: false, error: "AI did not return a valid question array." }
  }

  // Validate each question has the required fields
  for (const q of questions) {
    if (
      typeof q.prompt !== "string" ||
      !Array.isArray(q.options) ||
      q.options.length < 2 ||
      typeof q.correctIndex !== "number"
    ) {
      logger.warn("ai.quiz.malformed_question", { dayTitle, durationMs: Date.now() - start })
      return { ok: false, error: "AI returned a malformed question object." }
    }
  }

  logger.info("ai.quiz.success", { dayTitle, questionCount: questions.slice(0, 3).length, durationMs: Date.now() - start })
  return { ok: true, questions: questions.slice(0, 3) }
}
