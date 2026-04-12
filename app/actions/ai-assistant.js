"use server"

import { logger } from "@/app/lib/logger"

/**
 * Shared helper — makes a single OpenRouter chat completion call.
 * Returns { ok: true, content } or { ok: false, error }.
 */
async function callOpenRouter(messages, maxTokens = 150) {
  if (!process.env.OPENROUTER_API_KEY) {
    return { ok: false, error: "OPENROUTER_API_KEY is not configured." }
  }

  const start = Date.now()
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
        messages,
        max_tokens: maxTokens,
      }),
    })
  } catch (err) {
    logger.error("ai.assistant.fetch_failed", { durationMs: Date.now() - start, error: err.message })
    return { ok: false, error: `Failed to reach the AI service. ${err.message}` }
  }

  if (!response.ok) {
    logger.warn("ai.assistant.api_error", { durationMs: Date.now() - start, status: response.status })
    return { ok: false, error: `AI service returned ${response.status}.` }
  }

  let apiData
  try {
    apiData = await response.json()
  } catch {
    logger.error("ai.assistant.parse_error", { durationMs: Date.now() - start })
    return { ok: false, error: "Could not parse the AI response." }
  }

  const content = apiData?.choices?.[0]?.message?.content?.trim()
  if (!content) {
    logger.warn("ai.assistant.no_content", { durationMs: Date.now() - start })
    return { ok: false, error: "No content returned from the AI." }
  }

  logger.info("ai.assistant.success", { durationMs: Date.now() - start })
  return { ok: true, content }
}

/**
 * Get a 2-sentence ELI5 (Explain Like I'm 5) explanation of a lesson.
 * Called from AIAssistant component via server action.
 *
 * @param {string} lessonText - The lesson content to explain
 * @returns {{ ok: boolean, explanation?: string, error?: string }}
 */
export async function getELI5Explanation(lessonText) {
  if (!lessonText?.trim()) {
    return { ok: false, error: "No lesson text provided." }
  }

  logger.info("ai.assistant.eli5.start", { lessonLength: lessonText.length })
  const result = await callOpenRouter(
    [
      {
        role: "system",
        content:
          "You are a friendly AI tutor. Explain the given lesson in exactly 2 simple sentences as if explaining to a curious 5-year-old. Use everyday words and a simple analogy. Output ONLY the 2 sentences, nothing else.",
      },
      {
        role: "user",
        content: `Explain this simply: ${lessonText.slice(0, 500)}`,
      },
    ],
    150,
  )

  if (!result.ok) return result
  return { ok: true, explanation: result.content }
}

/**
 * Generate an alternative reinforcement explanation for a student who has
 * failed the quiz 3 times. Uses a completely different angle/analogy.
 *
 * @param {string} lessonText - The original lesson content
 * @param {string} dayTitle   - The day/module title for context
 * @returns {{ ok: boolean, explanation?: string, error?: string }}
 */
export async function getReinforcementExplanation(lessonText, dayTitle) {
  if (!lessonText?.trim()) {
    return { ok: false, error: "No lesson text provided." }
  }

  logger.info("ai.assistant.reinforcement.start", { dayTitle, lessonLength: lessonText.length })
  const result = await callOpenRouter(
    [
      {
        role: "system",
        content:
          "You are a patient AI teacher. A student is struggling with a concept. Provide a DIFFERENT, clearer 3–4 sentence explanation using a completely new angle, analogy, or real-world example. Output ONLY the explanation.",
      },
      {
        role: "user",
        content: `The student is struggling with "${dayTitle || "this lesson"}". Original content: ${lessonText.slice(0, 600)}. Give an alternative explanation.`,
      },
    ],
    220,
  )

  if (!result.ok) return result
  return { ok: true, explanation: result.content }
}
