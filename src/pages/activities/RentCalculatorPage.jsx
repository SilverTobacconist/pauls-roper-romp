import { Calculator } from 'lucide-react'

import ActivityLayout from '../../layouts/ActivityLayout'

function RentCalculatorPage() {
  return (
    <ActivityLayout
      eyebrow="Stanley’s Financial Department"
      title="Stanley’s Rent Calculator"
      description="Calculate your rent after parties, broken lamps, suspicious visitors, and unauthorized laughter."
      icon={Calculator}
    >
      <div className="activity-placeholder">
        <p className="activity-placeholder__label">
          First activity we will build
        </p>

        <h2>Stanley is preparing the surcharges.</h2>

        <p>
          This page will become the first fully interactive activity
          because it needs no database, audio storage, or moderation.
          A rare moment of restraint.
        </p>
      </div>
    </ActivityLayout>
  )
}

export default RentCalculatorPage