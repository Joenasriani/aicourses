/**
 * Single source of truth for all course hero images.
 *
 * Rules
 * ──────────────────────────────────────────────────────────────────
 * • Every key matches a course slug exactly (directory name under content/courses/).
 * • Values are absolute paths served from /public (i.e. start with "/courses/").
 * • All images are local WebP files committed in /public/courses/.
 * • Any course whose slug is NOT listed here will be hard-blocked from rendering.
 */

export type CourseImageMap = Record<string, string>

const courseImages: CourseImageMap = {
  'chatgpt-start':        '/courses/chatgpt-start.webp',
  'claude-start':         '/courses/claude-start.webp',
  'gemini-start':         '/courses/gemini-start.webp',
  'chatgpt-seniors':      '/courses/chatgpt-seniors.webp',
  'claude-seniors':       '/courses/claude-seniors.webp',
  'gemini-seniors':       '/courses/gemini-seniors.webp',
  'ai-seniors-daily':     '/courses/ai-seniors-daily.webp',
  'build-ai-no-code':     '/courses/build-ai-no-code.webp',
  'design-web-ai':        '/courses/design-web-ai.webp',
  'automate-business-ai': '/courses/automate-business-ai.webp',
  'ai-workflows':         '/courses/ai-workflows.webp',
  'figma-to-ai':          '/courses/figma-to-ai.webp',
  'ai-content-systems':   '/courses/ai-content-systems.webp',
}

export default courseImages
