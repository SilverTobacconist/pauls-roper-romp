import { Ear } from 'lucide-react'

import ActivityLayout from '../../layouts/ActivityLayout'

function MrRoperHeardPage() {
  return (
    <ActivityLayout
      eyebrow="The Great Hastings Misunderstanding"
      title="What Did Mr. Roper Hear?"
      description="Listen carefully, type what you heard, and record the next version of the phrase."
      icon={Ear}
    >
      <div className="activity-placeholder">
        <p className="activity-placeholder__label">
          Coming in a later build stage
        </p>

        <h2>The message is already deteriorating.</h2>

        <p>
          This page will handle audio playback, typed guesses,
          recording, chain locking, and the final 7 PM reveal.
        </p>
      </div>
    </ActivityLayout>
  )
}

export default MrRoperHeardPage