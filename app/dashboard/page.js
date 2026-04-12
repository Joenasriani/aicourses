import fs from "fs"
import path from "path"
import DashboardClient from "./DashboardClient"

function getAllCourses() {
  const base = path.join(process.cwd(), "content/courses")
  if (!fs.existsSync(base)) return []
  return fs
    .readdirSync(base)
    .map((slug) => {
      const file = path.join(base, slug, "course.json")
      if (!fs.existsSync(file)) return null
      const data = JSON.parse(fs.readFileSync(file, "utf-8"))
      return { slug, ...data }
    })
    .filter(Boolean)
}

export const metadata = {
  title: "Dashboard — AI Academy",
  description: "Track your learning progress, XP, and streaks.",
}

export default function DashboardPage() {
  const courses = getAllCourses()
  return <DashboardClient courses={courses} />
}
