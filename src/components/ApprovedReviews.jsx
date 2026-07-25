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

const CARD_VARIANTS = [
  'cream',
  'yellow',
  'pink',
  'blue',
  'green',
  'white',
]

const PIN_VARIANTS = [
  'red',
  'blue',
  'green',
  'yellow',
  'white',
]

const DEFECT_VARIANTS = [
  'none',
  'folded-corner',
  'coffee-stain',
  'tape',
  'worn-edge',
]

const CARD_LAYOUTS = [
  {
    rotation: -1.8,
    offsetX: -3,
    offsetY: 2,
  },
  {
    rotation: 1.1,
    offsetX: 4,
    offsetY: -2,
  },
  {
    rotation: -0.7,
    offsetX: 2,
    offsetY: 5,
  },
  {
    rotation: 1.6,
    offsetX: -4,
    offsetY: 1,
  },
  {
    rotation: -1.1,
    offsetX: 5,
    offsetY: 3,
  },
  {
    rotation: 0.6,
    offsetX: -2,
    offsetY: -3,
  },
  {
    rotation: -1.5,
    offsetX: 3,
    offsetY: 1,
  },
  {
    rotation: 1.3,
    offsetX: -5,
    offsetY: 4,
  },
  {
    rotation: -0.4,
    offsetX: 4,
    offsetY: -1,
  },
  {
    rotation: 1.8,
    offsetX: -3,
    offsetY: 3,
  },
  {
    rotation: -1,
    offsetX: 1,
    offsetY: -2,
  },
  {
    rotation: 0.9,
    offsetX: -1,
    offsetY: 5,
  },
]

const MAX_VISIBLE_REVIEWS = 12

function shuffleItems(items) {
  const shuffledItems = [...items]

  for (
    let currentIndex = shuffledItems.length - 1;
    currentIndex > 0;
    currentIndex -= 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * (currentIndex + 1),
    )

    const currentItem = shuffledItems[currentIndex]

    shuffledItems[currentIndex] =
      shuffledItems[randomIndex]

    shuffledItems[randomIndex] = currentItem
  }

  return shuffledItems
}

function createDisplayReviews(approvedReviews) {
  return shuffleItems(approvedReviews)
    .slice(0, MAX_VISIBLE_REVIEWS)
    .map((review, index) => {
      const layout =
        CARD_LAYOUTS[index % CARD_LAYOUTS.length]

      return {
        ...review,
        displayStyle: {
          cardVariant:
            CARD_VARIANTS[
              Math.floor(Math.random() * CARD_VARIANTS.length)
            ],
          pinVariant:
            PIN_VARIANTS[
              Math.floor(Math.random() * PIN_VARIANTS.length)
            ],
          defectVariant:
            DEFECT_VARIANTS[
              Math.floor(Math.random() * DEFECT_VARIANTS.length)
            ],
          rotation: layout.rotation,
          offsetX: layout.offsetX,
          offsetY: layout.offsetY,
          stampRotation:
            Math.floor(Math.random() * 11) - 5,
        },
      }
    })
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

  const loadReviews = useCallback(async () => {
    setLoadStatus('loading')

    try {
      const approvedReviews =
        await getApprovedRopersReviews()

      setReviews(createDisplayReviews(approvedReviews))
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

        setReviews(createDisplayReviews(approvedReviews))
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

  function handleWallShuffle() {
    setReviews((currentReviews) =>
      createDisplayReviews(currentReviews),
    )
  }

  return (
    <section
      className="review-wall"
      aria-labelledby="review-wall-title"
    >
      <div className="review-wall__header">
        <div>
          <p>Passed Stanley’s Inspection</p>

          <h2 id="review-wall-title">
            Stanley’s Wall of Reviews
          </h2>

          <span>
            Approved complaints, questionable observations,
            and opinions no one requested.
          </span>
        </div>

        <button
          className="review-wall__shuffle"
          type="button"
          disabled={loadStatus === 'loading'}
          onClick={handleWallShuffle}
        >
          <RefreshCw
            aria-hidden="true"
            size={16}
            className={
              loadStatus === 'loading'
                ? 'review-wall__spinner'
                : ''
            }
          />

          Shuffle the Wall
        </button>
      </div>

      {loadStatus === 'loading' && (
        <div
          className="review-wall__state"
          role="status"
        >
          <RefreshCw
            aria-hidden="true"
            size={24}
            className="review-wall__spinner"
          />

          <p>Checking Stanley’s filing cabinet...</p>
        </div>
      )}

      {loadStatus === 'error' && (
        <div
          className="review-wall__state review-wall__state--error"
          role="alert"
        >
          <AlertCircle aria-hidden="true" size={24} />

          <div>
            <strong>The review wall is unavailable.</strong>

            <p>
              Stanley denies knowing who misplaced the folder.
            </p>

            <button
              className="review-wall__retry"
              type="button"
              onClick={() => {
                void loadReviews()
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {loadStatus === 'success' &&
        reviews.length === 0 && (
          <div className="review-wall__state">
            <CheckCircle2
              aria-hidden="true"
              size={24}
            />

            <div>
              <strong>No approved reviews yet.</strong>

              <p>
                The wall remains tragically free of uninformed
                opinions.
              </p>
            </div>
          </div>
        )}

      {loadStatus === 'success' &&
        reviews.length > 0 && (
          <div className="review-wall__board">
            {reviews.map((review) => {
              const {
                cardVariant,
                pinVariant,
                defectVariant,
                rotation,
                offsetX,
                offsetY,
                stampRotation,
              } = review.displayStyle

              return (
                <article
                  className={[
                    'review-wall-card',
                    `review-wall-card--${cardVariant}`,
                    `review-wall-card--defect-${defectVariant}`,
                  ].join(' ')}
                  style={{
                    '--review-card-rotation': `${rotation}deg`,
                    '--review-card-offset-x': `${offsetX}px`,
                    '--review-card-offset-y': `${offsetY}px`,
                    '--review-stamp-rotation': `${stampRotation}deg`,
                  }}
                  key={review.id}
                >
                  <span
                    className={[
                      'review-wall-card__pin',
                      `review-wall-card__pin--${pinVariant}`,
                    ].join(' ')}
                    aria-hidden="true"
                  />

                  <span
                    className="review-wall-card__defect"
                    aria-hidden="true"
                  />

                  <div className="review-wall-card__top">
                    <div>
                      <p>
                        {CATEGORY_LABELS[review.category] ??
                          'Unclassified Complaint'}
                      </p>

                      <h3>{review.subject}</h3>
                    </div>

                    <div
                      className="review-wall-card__rating"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {Array.from(
                        { length: 5 },
                        (_, starIndex) => (
                          <Star
                            aria-hidden="true"
                            size={15}
                            fill={
                              starIndex < review.rating
                                ? 'currentColor'
                                : 'none'
                            }
                            key={starIndex}
                          />
                        ),
                      )}
                    </div>
                  </div>

                  <blockquote>
                    “{review.review}”
                  </blockquote>

                  <div className="review-wall-card__footer">
                    <span>
                      Filed by {review.display_name}
                    </span>

                    <time dateTime={review.created_at}>
                      {formatReviewDate(review.created_at)}
                    </time>
                  </div>

                  <div
                    className="review-wall-card__stamp"
                    aria-label="Approved by Stanley"
                  >
                    <span>Approved</span>
                    <strong>By Stanley</strong>
                  </div>
                </article>
              )
            })}
          </div>
        )}
    </section>
  )
}

export default ApprovedReviews