import { MessageSquareText } from 'lucide-react'

import ActivityLayout from '../../layouts/ActivityLayout'

function ReviewsPage() {
  return (
    <ActivityLayout
      eyebrow="The Critic’s Choice"
      title="Hilariously Inaccurate Reviews"
      description="Review a cocktail, outfit, business, or anything else you barely observed."
      icon={MessageSquareText}
    >
      <div className="activity-placeholder">
        <p className="activity-placeholder__label">
          Coming in the next build stage
        </p>

        <h2>The critics are still drinking.</h2>

        <p>
          This page will contain the review form, character prompts,
          moderation system, and public review wall.
        </p>
      </div>
    </ActivityLayout>
  )
}

export default ReviewsPage