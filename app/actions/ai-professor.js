"use server"

export async function generateCourse(formData) {
  const topic = formData.get("topic")
  const difficulty = formData.get("difficulty")

  if (!process.env.OPENROUTER_API_KEY) {
    return "Error: OPENROUTER_API_KEY is not configured."
  }

  if (!topic || !topic.trim()) {
    return "Error: Please provide a course topic."
  }

  let response
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "system",
            content: "You are a world-class AI Professor at Robomarket Academy. Generate a structured course in Markdown. Include: # Title, ## Lesson Overview, ## Deep Dive, ### Code Example, and a 3-question Quiz.",
          },
          {
            role: "user",
            content: `Create a ${difficulty} level course on the topic: "${topic}".`,
          },
        ],
      }),
    })
  } catch (err) {
    return `Error: Failed to reach the AI service. ${err.message}`
  }

  if (!response.ok) {
    let detail = ""
    try {
      const errData = await response.json()
      detail = errData?.error?.message || JSON.stringify(errData)
    } catch {
      detail = await response.text()
    }
    return `Error: OpenRouter returned ${response.status}. ${detail}`
  }

  let data
  try {
    data = await response.json()
  } catch {
    return "Error: Could not parse the AI response."
  }

  const content = data?.choices?.[0]?.message?.content
  if (!content) {
    return "Error: No content returned from the AI."
  }

  return content
}
