import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Star,
} from 'lucide-react'

import { getApprovedRopersReviews } from '../lib/getApprovedRopersReviews'

const CATEGORY_LABELS = {
  cocktail: 'A Cocktail',
  outfit: 'Someone’s Outfit',
  conversation: 'A Conversation',
  business: 'An Imaginary Business',
  anything: 'Anything in the Room',
}

function formatReviewDate(dateValue) {
  if (!dateValue) {
    return ''
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateValue))
}

function ApprovedReviews() {
  const [reviews, setReviews] = useState([])
  const [loadStatus, setLoadStatus] = useState('loading')

  const refreshReviews = useCallback(async () => {
    setLoadStatus('loading')

    try {
      const approvedReviews =
        await getApprovedRopersReviews()

      setReviews(approvedReviews)
      setLoadStatus('success')
    } catch {
      setLoadStatus('error')
    }
  }, [])

  useEffect(() => {
    let isCancelled = false

    getApprovedRopersReviews()
      .then((approvedReviews) => {
        if (isCancelled) {
          return
        }

        setReviews(approvedReviews)
        setLoadStatus('success')
      })
      .catch(() => {
        if (!isCancelled) {
          setLoadStatus('error')
        }
      })

    return () => {
      isCancelled = true
    }
  }, [])

  return (
    <section
      className="approved-reviews"
      aria-labelledby="approved-reviews-title"
    >
      <div className="approved-reviews__heading">
        <div>
          <p>Passed Stanley’s Inspection</p>

          <h2 id="approved-reviews-title">
            Stanley Approved Reviews
          </h2>

          <span>
            Opinions deemed sufficiently confident for public
            consumption.
          </span>
        </div>

        <button
          className="approved-reviews__refresh"
          type="button"
          disabled={loadStatus === 'loading'}
          onClick={refreshReviews}
        >
          <RefreshCw
            aria-hidden="true"
            size={16}
            className={
              loadStatus === 'loading'
                ? 'approved-reviews__spinner'
                : ''
            }
          />

          Refresh
        </button>
      </div>

      {loadStatus === 'loading' && (
        <div
          className="approved-reviews__state"
          role="status"
        >
          <RefreshCw
            aria-hidden="true"
            size={24}
            className="approved-reviews__spinner"
          />

          <p>Checking Stanley’s filing cabinet...</p>
        </div>
      )}

      {loadStatus === 'error' && (
        <div
          className="approved-reviews__state approved-reviews__state--error"
          role="alert"
        >
          <AlertCircle aria-hidden="true" size={24} />

          <div>
            <strong>The filing cabinet is unavailable.</strong>

            <p>
              Approved reviews could not be loaded. Stanley
              denies responsibility.
            </p>
          </div>
        </div>
      )}

      {loadStatus === 'success' &&
        reviews.length === 0 && (
          <div className="approved-reviews__state">
            <CheckCircle2
              aria-hidden="true"
              size={24}
            />

            <div>
              <strong>No approved reviews yet.</strong>

              <p>
                Stanley is either inspecting them carefully or
                has wandered off with the folder.
              </p>
            </div>
          </div>
        )}

      {loadStatus === 'success' &&
        reviews.length > 0 && (
          <div className="approved-reviews__grid">
            {reviews.map((review) => (
              <article
                className="approved-review-card"
                key={review.id}
              >
                <div className="approved-review-card__top">
                  <div>
                    <p>
                      {CATEGORY_LABELS[review.category] ??
                        'Unclassified Complaint'}
                    </p>

                    <h3>{review.subject}</h3>
                  </div>

                  <div
                    className="approved-review-card__rating"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {Array.from(
                      { length: 5 },
                      (_, index) => (
                        <Star
                          aria-hidden="true"
                          size={16}
                          fill={
                            index < review.rating
                              ? 'currentColor'
                              : 'none'
                          }
                          key={index}
                        />
                      ),
                    )}
                  </div>
                </div>

                <blockquote>
                  “{review.review}”
                </blockquote>

                <div className="approved-review-card__footer">
                  <span>
                    Filed by {review.display_name}
                  </span>

                  <time dateTime={review.created_at}>
                    {formatReviewDate(
                      review.created_at,
                    )}
                  </time>
                </div>

                <div className="approved-review-card__stamp">
                  Stanley Approved
                </div>
              </article>
            ))}
          </div>
        )}
    </section>
  )
}

export default ApprovedReviews