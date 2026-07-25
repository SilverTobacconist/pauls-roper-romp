import { useEffect, useRef, useState } from 'react'

import {
  Calculator,
  Ear,
  MessageSquareText,
  ScrollText,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import apartmentExterior from '../assets/hero-apartment-exterior.png'
import apartmentInterior from '../assets/hero-apartment-interior.png'
import closedDoor from '../assets/door-201-closed.png'
import openDoor from '../assets/door-201-open.png'

const INTRO_STAGES = {
  CLOSED: 'closed',
  OPENING: 'opening',
  INSIDE: 'inside',
}

const activities = [
  {
    title: 'Critic’s Choice Reviews',
    description:
      'Write a wildly inaccurate review of a drink, outfit, business, or anything else you barely observed.',
    accent: 'orange',
    path: '/reviews',
    icon: MessageSquareText,
  },
  {
    title: 'What Did Mr. Roper Hear?',
    description:
      'Listen to the previous recording, type what you heard, and record the next misunderstanding.',
    accent: 'mustard',
    path: '/mr-roper-heard',
    icon: Ear,
  },
  {
    title: 'Lost Scripts',
    description:
      'Supply the missing words and create a disastrous lost episode of Three’s Company.',
    accent: 'green',
    path: '/lost-scripts',
    icon: ScrollText,
  },
  {
    title: 'Stanley’s Rent Calculator',
    description:
      'Calculate rent after parties, broken lamps, suspicious visitors, and unauthorized laughter.',
    accent: 'brown',
    path: '/rent-calculator',
    icon: Calculator,
  },
]

function ApartmentIntro() {
  const navigate = useNavigate()

  const [stage, setStage] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search)

    return searchParams.get('view') === 'menu'
      ? INTRO_STAGES.INSIDE
      : INTRO_STAGES.CLOSED
  })

  const audioContextRef = useRef(null)

  useEffect(() => {
    if (stage !== INTRO_STAGES.OPENING) {
      return undefined
    }

    const interiorTimer = window.setTimeout(() => {
      setStage(INTRO_STAGES.INSIDE)
    }, 1550)

    return () => {
      window.clearTimeout(interiorTimer)
    }
  }, [stage])

  function createKnock(audioContext, startTime, volume = 0.7) {
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(115, startTime)
    oscillator.frequency.exponentialRampToValueAtTime(
      70,
      startTime + 0.09,
    )

    gain.gain.setValueAtTime(volume, startTime)
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      startTime + 0.12,
    )

    oscillator.connect(gain)
    gain.connect(audioContext.destination)

    oscillator.start(startTime)
    oscillator.stop(startTime + 0.13)
  }

  async function playKnockingSound() {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext

    if (!AudioContextClass) {
      return
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass()
    }

    const audioContext = audioContextRef.current

    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    const now = audioContext.currentTime

    createKnock(audioContext, now)
    createKnock(audioContext, now + 0.19, 0.62)
    createKnock(audioContext, now + 0.47, 0.76)
  }

  async function handleKnock() {
    if (stage !== INTRO_STAGES.CLOSED) {
      return
    }

    await playKnockingSound()

    window.setTimeout(() => {
      setStage(INTRO_STAGES.OPENING)
    }, 650)
  }

  function handleReturnOutside() {
  setStage(INTRO_STAGES.CLOSED)
  navigate('/', { replace: true })
}

  const isOpening = stage === INTRO_STAGES.OPENING
  const isInside = stage === INTRO_STAGES.INSIDE

  return (
    <main className="apartment-intro">
      <div className="apartment-scene" aria-live="polite">
        <img
          className={`scene-layer scene-door scene-door-closed ${
            isOpening || isInside ? 'scene-layer--hidden' : ''
          }`}
          src={closedDoor}
          alt="The closed wooden door of Apartment 201"
        />

        <img
          className={`scene-layer scene-background scene-exterior ${
            isInside ? 'scene-layer--hidden' : ''
          }`}
          src={apartmentExterior}
          alt=""
        />

        <img
          className={`scene-layer scene-door scene-door-open ${
            isOpening ? 'scene-layer--visible' : ''
          }`}
          src={openDoor}
          alt="The open wooden door of Apartment 201"
        />

        <img
          className={`scene-layer scene-background scene-interior ${
            isInside ? 'scene-layer--visible' : ''
          }`}
          src={apartmentInterior}
          alt=""
        />

        <div
          className={`scene-shade ${
            isInside ? 'scene-shade--inside' : ''
          }`}
        />

        <section
          className={`intro-content ${
            isOpening || isInside ? 'intro-content--hidden' : ''
          }`}
        >
          <p className="intro-kicker">
            Paul’s Cigar Lounge Presents
          </p>

          <h1 className="intro-title">
            Come and Knock on Our Pour
          </h1>

          <button
            className="enter-button"
            type="button"
            onClick={handleKnock}
          >
            Knock
          </button>

          <p className="intro-instruction">
            Knock on the door to enter the Roper Romp experience.
          </p>
        </section>

        {isOpening && (
          <div className="opening-message" role="status">
            <span className="opening-message__line">
              Just a minute!
            </span>
          </div>
        )}

        {isInside && (
          <section className="home-menu">
            <div className="home-menu__heading">
              <p className="inside-kicker">
                Welcome to Apartment 201
              </p>

              <h2>Choose Your Experience</h2>

              <p>
                Four activities. Three roommates. Several entirely
                preventable misunderstandings.
              </p>
            </div>

            <div className="activity-menu">
              {activities.map((activity) => {
                const Icon = activity.icon

                return (
                  <Link
                    className={`activity-menu__card activity-menu__card--${activity.accent}`}
                    key={activity.title}
                    to={activity.path}
                  >
                    <span className="activity-menu__icon">
                      <Icon
                        aria-hidden="true"
                        size={28}
                        strokeWidth={1.8}
                      />
                    </span>

                    <span className="activity-menu__title">
                      {activity.title}
                    </span>

                    <span className="activity-menu__description">
                      {activity.description}
                    </span>

                    <span
                      className="activity-menu__link"
                      aria-hidden="true"
                    >
                      Enter activity →
                    </span>
                  </Link>
                )
              })}
            </div>

            <button
              className="secondary-button home-menu__return"
              type="button"
              onClick={handleReturnOutside}
            >
              Return to the Hallway
            </button>
          </section>
        )}

        {!isOpening && !isInside && (
          <button
            className="door-click-target"
            type="button"
            aria-label="Knock on the door to Apartment 201"
            onClick={handleKnock}
          />
        )}
      </div>
    </main>
  )
}

export default ApartmentIntro