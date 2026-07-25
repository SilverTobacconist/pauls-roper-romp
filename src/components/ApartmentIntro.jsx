import { useEffect, useState } from 'react'

import apartmentInterior from '../assets/hero-apartment-interior.png'
import apartmentExterior from '../assets/hero-apartment-exterior.png'
import closedDoor from '../assets/door-201-closed.png'
import openDoor from '../assets/door-201-open.png'

const INTRO_STAGES = {
  CLOSED: 'closed',
  OPENING: 'opening',
  INSIDE: 'inside',
}

function ApartmentIntro() {
  const [stage, setStage] = useState(INTRO_STAGES.CLOSED)

  useEffect(() => {
    if (stage !== INTRO_STAGES.OPENING) {
      return undefined
    }

    const interiorTimer = window.setTimeout(() => {
      setStage(INTRO_STAGES.INSIDE)
    }, 1300)

    return () => {
      window.clearTimeout(interiorTimer)
    }
  }, [stage])

  function handleEnterApartment() {
    if (stage !== INTRO_STAGES.CLOSED) {
      return
    }

    setStage(INTRO_STAGES.OPENING)
  }

  function handleReturnOutside() {
    setStage(INTRO_STAGES.CLOSED)
  }

  const isOpening = stage === INTRO_STAGES.OPENING
  const isInside = stage === INTRO_STAGES.INSIDE

  return (
    <main
      className={`apartment-intro ${
        isInside ? 'apartment-intro--inside' : ''
      }`}
    >
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
          <p className="intro-kicker">Paul’s Cigar Lounge Presents</p>

          <h1 className="intro-title">Come and Knock on Our Pour</h1>

          <p className="intro-description">
            Step inside Apartment 201 for cocktails, questionable
            reviews, lost scripts, and several misunderstandings that
            could have been prevented by speaking clearly.
          </p>

          <button
            className="enter-button"
            type="button"
            onClick={handleEnterApartment}
          >
            Enter Apartment 201
          </button>

          <p className="intro-instruction">
            Tap the door to begin the Roper Romp experience.
          </p>
        </section>

        {isOpening && (
          <div className="opening-message" role="status">
            <span className="opening-message__line">
              Come and knock on our door…
            </span>
          </div>
        )}

        {isInside && (
          <section className="inside-content">
            <p className="inside-kicker">Welcome to Apartment 201</p>

            <h2>The party has started.</h2>

            <p>
              This will become the main activity menu during the next
              build step.
            </p>

            <button
              className="secondary-button"
              type="button"
              onClick={handleReturnOutside}
            >
              Test the Intro Again
            </button>
          </section>
        )}

        {!isOpening && !isInside && (
          <button
            className="door-click-target"
            type="button"
            aria-label="Open the door to Apartment 201"
            onClick={handleEnterApartment}
          />
        )}
      </div>
    </main>
  )
}

export default ApartmentIntro