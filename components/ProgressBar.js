"use client"

/** ProgressBar — displays course completion as a filled bar.
 *  @param {number} completed  Number of completed cards
 *  @param {number} total      Total cards in course / day
 */
export default function ProgressBar({ completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="progress-bar-track">
      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}
