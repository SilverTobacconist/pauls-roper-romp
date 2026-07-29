import {
  Check,
  Copy,
  Share2,
  X,
} from 'lucide-react'
import { useState } from 'react'

const SHARE_URL =
  'https://roperromp.netlify.app/'

const SHARE_TITLE =
  "Roper Romp at Paul's"

const SHARE_TEXT =
  "Step into the laughter with Roper Romp at Paul's."

function ShareTheRomp() {
  const [isOpen, setIsOpen] =
    useState(false)

  const [status, setStatus] =
    useState('')

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(
        SHARE_URL,
      )

      setStatus('Link copied!')

      window.setTimeout(() => {
        setStatus('')
        setIsOpen(false)
      }, 1600)
    } catch {
      setStatus(
        'Copy failed. Use roperromp.netlify.app',
      )
    }
  }

  async function shareSite() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: SHARE_TITLE,
          text: SHARE_TEXT,
          url: SHARE_URL,
        })

        setStatus('Shared!')
        setIsOpen(false)
        return
      } catch (error) {
        if (
          error?.name === 'AbortError'
        ) {
          return
        }
      }
    }

    await copyShareLink()
  }

  if (!isOpen) {
    return (
      <button
        aria-label="Share Roper Romp"
        className="romp-share romp-share--compact"
        type="button"
        onClick={() => {
          setStatus('')
          setIsOpen(true)
        }}
      >
        <Share2
          aria-hidden="true"
          size={19}
        />

        <span>Share the Romp</span>
      </button>
    )
  }

  return (
    <aside
      aria-label="Share Roper Romp"
      className="romp-share romp-share--expanded"
    >
      <div className="romp-share__heading">
        <div>
          <span className="romp-share__eyebrow">
            Invite the neighbors
          </span>

          <strong>
            Share the Romp
          </strong>
        </div>

        <button
          aria-label="Close sharing options"
          className="romp-share__close"
          type="button"
          onClick={() => {
            setStatus('')
            setIsOpen(false)
          }}
        >
          <X
            aria-hidden="true"
            size={18}
          />
        </button>
      </div>

      <p>
        Send someone directly to the
        questionable decisions.
      </p>

      <button
        className="romp-share__primary"
        type="button"
        onClick={shareSite}
      >
        <Share2
          aria-hidden="true"
          size={18}
        />

        Share Now
      </button>

      <button
        className="romp-share__secondary"
        type="button"
        onClick={copyShareLink}
      >
        {status === 'Link copied!' ? (
          <Check
            aria-hidden="true"
            size={17}
          />
        ) : (
          <Copy
            aria-hidden="true"
            size={17}
          />
        )}

        {status === 'Link copied!'
          ? 'Link Copied'
          : 'Copy Link'}
      </button>

      {status && (
        <span
          aria-live="polite"
          className="romp-share__status"
        >
          {status}
        </span>
      )}
    </aside>
  )
}

export default ShareTheRomp