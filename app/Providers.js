"use client"

import { LearningProvider } from "./context/LearningContext"

/** Client wrapper that provides LearningContext without breaking SSR in layout.js */
export default function Providers({ children }) {
  return <LearningProvider>{children}</LearningProvider>
}
