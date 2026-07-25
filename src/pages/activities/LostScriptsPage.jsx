import { ScrollText } from 'lucide-react'

import ActivityLayout from '../../layouts/ActivityLayout'

function LostScriptsPage() {
  return (
    <ActivityLayout
      eyebrow="Recovered from Apartment 201"
      title="Lost Scripts"
      description="Supply the missing words and create a disastrous new Three’s Company scene."
      icon={ScrollText}
    >
      <div className="activity-placeholder">
        <p className="activity-placeholder__label">
          Coming in a later build stage
        </p>

        <h2>The writers misplaced several important nouns.</h2>

        <p>
          This page will generate screenplay-style prompts, collect
          answers, and display approved lost episodes.
        </p>
      </div>
    </ActivityLayout>
  )
}

export default LostScriptsPage