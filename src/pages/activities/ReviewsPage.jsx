import { useMemo, useState } from 'react'
import {
  Check,
  MessageSquareText,
  RefreshCw,
  Send,
  Star,
} from 'lucide-react'

import ActivityLayout from '../../layouts/ActivityLayout'

const REVIEW_TARGETS = [
  {
    value: 'cocktail',
    label: 'A Cocktail',
    prompt:
      'Review a drink based on one sip, its garnish, or an opinion you formed before tasting it.',
    examples: [
      'Suspiciously competent',
      'Too much ice, emotionally',
      'Tastes expensive',
      'Clearly hiding something',
    ],
  },
  {
    value: 'outfit',
    label: 'Someone’s Outfit',
    prompt:
      'Critique an outfit with the authority of a person who owns at least one shirt.',
    examples: [
      'Bold use of buttons',
      'Dressed for several occasions',
      'The shoes know too much',
      'Confidently weather-resistant',
    ],
  },
  {
    value: 'conversation',
    label: 'A Conversation',
    prompt:
      'Review a conversation you overheard without understanding its context.',
    examples: [
      'Strong opening, confusing third act',
      'Too many names introduced',
      'Needed subtitles',
      'Would not attend the sequel',
    ],
  },
  {
    value: 'business',
    label: 'An Imaginary Business',
    prompt:
      'Invent and review a business that may or may not deserve to exist.',
    examples: [
      'Excellent parking, no visible entrance',
      'Staff seemed surprised by customers',
      'Ambitious use of carpeting',
      'Owner appears to be a lamp',
    ],
  },
  {
    value: 'anything',
    label: 'Anything in the Room',
    prompt:
      'Choose an object, sound, smell, or unexplained occurrence and judge it harshly.',
    examples: [
      'Chair was emotionally unavailable',
      'Lamp provided adequate lamp',
      'Plant refused to elaborate',
      'Door opened with unnecessary confidence',
    ],
  },
]

const MIN_REVIEW_LENGTH = 20
const MAX_REVIEW_LENGTH = 280

function getRandomItem(items) {
  const randomIndex = Math.floor(Math.random() * items.length)

  return items[randomIndex]
}

function ReviewsPage() {
  const [reviewTarget, setReviewTarget] = useState(
    REVIEW_TARGETS[0].value,
  )
  const [subjectName, setSubjectName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [rating, setRating] = useState(3)
  const [reviewText, setReviewText] = useState('')
  const [submittedReview, setSubmittedReview] = useState(null)
  const [formMessage, setFormMessage] = useState('')

  const selectedTarget = useMemo(
    () =>
      REVIEW_TARGETS.find(
        (target) => target.value === reviewTarget,
      ) ?? REVIEW_TARGETS[0],
    [reviewTarget],
  )

  const reviewLength = reviewText.trim().length
  const isReviewTooShort =
    reviewLength > 0 && reviewLength < MIN_REVIEW_LENGTH
  const isReviewTooLong = reviewText.length > MAX_REVIEW_LENGTH

  const previewSubject =
    subjectName.trim() || selectedTarget.label

  const previewName =
    displayName.trim() || 'An Unqualified Critic'

  function handleTargetChange(event) {
    setReviewTarget(event.target.value)
    setFormMessage('')
  }

  function useRandomPrompt() {
    const randomPrompt = getRandomItem(
      selectedTarget.examples,
    )

    setReviewText(randomPrompt)
    setFormMessage('')
  }

  function handleReviewChange(event) {
    const nextValue = event.target.value

    if (nextValue.length <= MAX_REVIEW_LENGTH) {
      setReviewText(nextValue)
      setFormMessage('')
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!subjectName.trim()) {
      setFormMessage(
        'Give the unfortunate subject of this review a name.',
      )
      return
    }

    if (!displayName.trim()) {
      setFormMessage(
        'Stanley requires a critic name for the complaint file.',
      )
      return
    }

    if (reviewLength < MIN_REVIEW_LENGTH) {
      setFormMessage(
        `Your review needs at least ${MIN_REVIEW_LENGTH} characters. Apparently even nonsense requires documentation.`,
      )
      return
    }

    setSubmittedReview({
      target: selectedTarget.label,
      subject: subjectName.trim(),
      name: displayName.trim(),
      rating,
      text: reviewText.trim(),
    })

    setFormMessage('')
  }

  function resetForm() {
    setReviewTarget(REVIEW_TARGETS[0].value)
    setSubjectName('')
    setDisplayName('')
    setRating(3)
    setReviewText('')
    setSubmittedReview(null)
    setFormMessage('')
  }

  return (
    <ActivityLayout
      eyebrow="The Critic’s Choice"
      title="Hilariously Inaccurate Reviews"
      description="Review a cocktail, outfit, conversation, business, or anything else you barely observed."
      icon={MessageSquareText}
    >
      <div className="reviews-builder">
        <form
          className="reviews-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="reviews-section-heading">
            <p>Stanley’s Complaint Department</p>
            <h2>File an Informed Opinion</h2>
            <span>
              Accuracy is discouraged. Confidence is mandatory.
            </span>
          </div>

          <div className="reviews-field">
            <label htmlFor="review-target">
              What are you reviewing?
            </label>

            <select
              id="review-target"
              value={reviewTarget}
              onChange={handleTargetChange}
            >
              {REVIEW_TARGETS.map((target) => (
                <option
                  value={target.value}
                  key={target.value}
                >
                  {target.label}
                </option>
              ))}
            </select>

            <small>{selectedTarget.prompt}</small>
          </div>

          <div className="reviews-field">
            <label htmlFor="subject-name">
              Name of the thing being reviewed
            </label>

            <input
              id="subject-name"
              type="text"
              value={subjectName}
              maxLength={70}
              placeholder="Example: The suspicious green cocktail"
              onChange={(event) => {
                setSubjectName(event.target.value)
                setFormMessage('')
              }}
            />
          </div>

          <fieldset className="reviews-rating">
            <legend>Your completely objective rating</legend>

            <div className="reviews-rating__buttons">
              {[1, 2, 3, 4, 5].map((starValue) => (
                <button
                  className={
                    starValue <= rating
                      ? 'reviews-star reviews-star--selected'
                      : 'reviews-star'
                  }
                  type="button"
                  aria-label={`${starValue} ${
                    starValue === 1 ? 'star' : 'stars'
                  }`}
                  aria-pressed={rating === starValue}
                  key={starValue}
                  onClick={() => {
                    setRating(starValue)
                    setFormMessage('')
                  }}
                >
                  <Star
                    aria-hidden="true"
                    size={27}
                    fill={
                      starValue <= rating
                        ? 'currentColor'
                        : 'none'
                    }
                  />
                </button>
              ))}
            </div>

            <span>
              {rating} out of 5 stars, based on rigorous
              speculation.
            </span>
          </fieldset>

          <div className="reviews-field">
            <div className="reviews-field__label-row">
              <label htmlFor="review-text">
                Your review
              </label>

              <button
                className="reviews-prompt-button"
                type="button"
                onClick={useRandomPrompt}
              >
                <RefreshCw aria-hidden="true" size={15} />
                Give Me a Bad Idea
              </button>
            </div>

            <textarea
              id="review-text"
              value={reviewText}
              rows={6}
              placeholder="Write something confidently inaccurate..."
              aria-describedby="review-length"
              onChange={handleReviewChange}
            />

            <div
              className="reviews-character-row"
              id="review-length"
            >
              <small
                className={
                  isReviewTooShort || isReviewTooLong
                    ? 'reviews-character-row__warning'
                    : ''
                }
              >
                Minimum {MIN_REVIEW_LENGTH} characters
              </small>

              <small>
                {reviewText.length}/{MAX_REVIEW_LENGTH}
              </small>
            </div>
          </div>

          <div className="reviews-field">
            <label htmlFor="display-name">
              Critic name
            </label>

            <input
              id="display-name"
              type="text"
              value={displayName}
              maxLength={40}
              placeholder="Example: A Concerned Neighbor"
              onChange={(event) => {
                setDisplayName(event.target.value)
                setFormMessage('')
              }}
            />
          </div>

          {formMessage && (
            <p className="reviews-form__message" role="alert">
              {formMessage}
            </p>
          )}

          <button
            className="reviews-submit-button"
            type="submit"
          >
            <Send aria-hidden="true" size={18} />
            Submit for Stanley’s Inspection
          </button>
        </form>

        <aside className="reviews-preview">
          <div className="reviews-preview__folder-tab">
            Critic’s Choice
          </div>

          <div className="reviews-index-card">
            <div className="reviews-index-card__heading">
              <div>
                <p>{selectedTarget.label}</p>
                <h2>{previewSubject}</h2>
              </div>

              <div
                className="reviews-index-card__rating"
                aria-label={`${rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    aria-hidden="true"
                    size={16}
                    fill={
                      index < rating
                        ? 'currentColor'
                        : 'none'
                    }
                    key={index}
                  />
                ))}
              </div>
            </div>

            <blockquote>
              “
              {reviewText.trim() ||
                'Your needlessly confident review will appear here.'}
              ”
            </blockquote>

            <p className="reviews-index-card__author">
              Filed by {previewName}
            </p>

            <div className="reviews-index-card__stamp">
              Unverified
            </div>
          </div>

          {submittedReview && (
            <div
              className="reviews-success"
              role="status"
            >
              <Check aria-hidden="true" size={22} />

              <div>
                <strong>Review prepared successfully.</strong>
                <span>
                  The database connection comes next. For now,
                  Stanley has placed it in an imaginary folder.
                </span>
              </div>
            </div>
          )}

          <button
            className="reviews-reset-button"
            type="button"
            onClick={resetForm}
          >
            <RefreshCw aria-hidden="true" size={16} />
            Clear the Complaint
          </button>
        </aside>
      </div>
    </ActivityLayout>
  )
}

export default ReviewsPage