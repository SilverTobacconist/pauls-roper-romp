import { useEffect, useState } from 'react'
import { Ear, LoaderCircle } from 'lucide-react'

import ActivityLayout from '../../layouts/ActivityLayout'

import {
  claimRoperTurn,
  getRoperActivityState,
} from '../../lib/roperService'

const PAGE_STATES = {
  LOADING: 'loading',
  ACTIVE_TURN: 'active-turn',
  WAITING: 'waiting',
  REVEAL: 'reveal',
  UNAVAILABLE: 'unavailable',
  ERROR: 'error',
}

function getClaimStatus(claimResult) {
  return claimResult?.status || claimResult?.mode || null
}

function MrRoperHeardPage() {
  const [pageState, setPageState] = useState(
    PAGE_STATES.LOADING,
  )

  const [activityState, setActivityState] =
    useState(null)

  const [claimResult, setClaimResult] =
    useState(null)

  const [errorMessage, setErrorMessage] =
    useState('')

  useEffect(() => {
    let isCancelled = false

    async function initializeRoperActivity() {
      try {
        setPageState(PAGE_STATES.LOADING)
        setErrorMessage('')

        const currentActivityState =
          await getRoperActivityState()

        if (isCancelled) {
          return
        }

        setActivityState(currentActivityState)

        if (currentActivityState?.mode === 'reveal') {
          setPageState(PAGE_STATES.REVEAL)
          return
        }

        const currentClaimResult =
          await claimRoperTurn()

        if (isCancelled) {
          return
        }

        setClaimResult(currentClaimResult)

        const claimStatus =
          getClaimStatus(currentClaimResult)

        switch (claimStatus) {
          case 'claimed':
          case 'resumed':
          case 'your_turn':
            setPageState(PAGE_STATES.ACTIVE_TURN)
            break

          case 'waiting':
            setPageState(PAGE_STATES.WAITING)
            break

          case 'reveal':
            setPageState(PAGE_STATES.REVEAL)
            break

          case 'unavailable':
          case 'complete':
          case 'closed':
            setPageState(PAGE_STATES.UNAVAILABLE)
            break

          default:
            throw new Error(
              `Unexpected Roper claim status: ${
                claimStatus || 'missing'
              }`,
            )
        }
      } catch (error) {
        if (isCancelled) {
          return
        }

        console.error(
          'Could not initialize the Roper activity:',
          error,
        )

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'The activity could not be loaded.',
        )

        setPageState(PAGE_STATES.ERROR)
      }
    }

    initializeRoperActivity()

    return () => {
      isCancelled = true
    }
  }, [])

  return (
    <ActivityLayout
      eyebrow="The Great Hastings Misunderstanding"
      title="What Did Mr. Roper Hear?"
      description="Listen carefully, type what you heard, and record the next version of the phrase."
      icon={Ear}
    >
      {pageState === PAGE_STATES.LOADING && (
        <div
          className="activity-placeholder"
          role="status"
          aria-live="polite"
        >
          <LoaderCircle
            aria-hidden="true"
            size={34}
            strokeWidth={1.8}
          />

          <p className="activity-placeholder__label">
            Checking the hallway
          </p>

          <h2>Finding the next misunderstanding...</h2>

          <p>
            Mr. Roper is reviewing the situation with his usual
            commitment to accuracy.
          </p>
        </div>
      )}

      {pageState === PAGE_STATES.ACTIVE_TURN && (
        <div className="activity-placeholder">
          <p className="activity-placeholder__label">
            Turn ready
          </p>

          <h2>
            {claimResult?.status === 'resumed'
              ? 'Your misunderstanding has been resumed.'
              : 'Your misunderstanding is ready.'}
          </h2>

          <p>
            You have Turn {claimResult?.turn_number ?? '—'} in
            Conversation{' '}
            {claimResult?.conversation_number ?? '—'}.
          </p>

          {claimResult?.character_name && (
            <p>
              <strong>Character:</strong>{' '}
              {claimResult.character_name}
            </p>
          )}

          <div className="activity-placeholder__details">
            <p>
              Playback required:{' '}
              {claimResult?.requires_playback
                ? 'Yes'
                : 'No'}
            </p>

            <p>
              Typed phrase required:{' '}
              {claimResult?.requires_typed_text
                ? 'Yes'
                : 'No'}
            </p>

            <p>
              Recording required:{' '}
              {claimResult?.requires_recording
                ? 'Yes'
                : 'No'}
            </p>
          </div>

          {claimResult?.turn_number === 1 &&
            claimResult?.original_phrase && (
              <div className="activity-placeholder__details">
                <p>
                  <strong>Original phrase:</strong>
                </p>

                <p>{claimResult.original_phrase}</p>
              </div>
            )}

          <p>
            The actual playback, typing, and recording controls
            arrive in the next build stage.
          </p>
        </div>
      )}

      {pageState === PAGE_STATES.WAITING && (
        <div
          className="activity-placeholder"
          role="status"
          aria-live="polite"
        >
          <p className="activity-placeholder__label">
            Please wait
          </p>

          <h2>
            Someone is currently misunderstanding the situation.
          </h2>

          <p>Please wait a moment.</p>

          {Number.isFinite(
            Number(claimResult?.seconds_remaining),
          ) && (
            <p>
              Their reservation has about{' '}
              {Math.max(
                0,
                Math.ceil(
                  Number(
                    claimResult.seconds_remaining,
                  ),
                ),
              )}{' '}
              seconds remaining.
            </p>
          )}

          <p>
            Automatic waiting-room updates will be added in the
            next stage.
          </p>
        </div>
      )}

      {pageState === PAGE_STATES.REVEAL && (
        <div className="activity-placeholder">
          <p className="activity-placeholder__label">
            Conversations revealed
          </p>

          <h2>Mr. Roper has heard enough.</h2>

          <p>
            The completed misunderstanding chains are now
            available.
          </p>

          <p>
            The full reveal display and audio controls will be
            added after the gameplay screens are finished.
          </p>

          {activityState?.reveal_at && (
            <p>
              Reveal time:{' '}
              {new Date(
                activityState.reveal_at,
              ).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {pageState === PAGE_STATES.UNAVAILABLE && (
        <div className="activity-placeholder">
          <p className="activity-placeholder__label">
            Activity unavailable
          </p>

          <h2>No misunderstanding is available right now.</h2>

          <p>
            The activity may be complete, paused, or waiting for
            another conversation cycle to begin.
          </p>
        </div>
      )}

      {pageState === PAGE_STATES.ERROR && (
        <div
          className="activity-placeholder"
          role="alert"
        >
          <p className="activity-placeholder__label">
            Something went wrong
          </p>

          <h2>Mr. Roper lost the message entirely.</h2>

          <p>{errorMessage}</p>

          <button
            className="primary-button"
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}
    </ActivityLayout>
  )
}

export default MrRoperHeardPage