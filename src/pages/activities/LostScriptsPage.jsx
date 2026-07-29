import {
  ArrowLeft,
  Check,
  Clapperboard,
  Download,
  FileText,
  RefreshCw,
  ScrollText,
  Sparkles,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { jsPDF } from 'jspdf'

import ActivityLayout from '../../layouts/ActivityLayout'
import lostScripts from '../../data/lostScripts'

const PHASES = {
  PICKER: 'picker',
  FORM: 'form',
  RESTORING: 'restoring',
  REVEAL: 'reveal',
}

const COMPLETED_STORAGE_KEY =
  'pauls-roper-romp-lost-scripts-completed'

const RESTORING_MESSAGES = [
  'Recovering missing dialogue...',
  'Finding stage directions...',
  'Repairing damaged pages...',
  'Removing suspicious coffee stains...',
  'Restoring script...',
]

function shufflePrompts(prompts) {
  const shuffledPrompts = [...prompts]

  for (
    let index = shuffledPrompts.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1),
    )

    const currentPrompt =
      shuffledPrompts[index]

    shuffledPrompts[index] =
      shuffledPrompts[randomIndex]

    shuffledPrompts[randomIndex] =
      currentPrompt
  }

  prompts.forEach((prompt) => {
    if (!prompt.mustComeAfter) {
      return
    }

    const dependentIndex =
      shuffledPrompts.findIndex(
        (item) => item.id === prompt.id,
      )

    const requiredIndex =
      shuffledPrompts.findIndex(
        (item) =>
          item.id === prompt.mustComeAfter,
      )

    if (
      dependentIndex === -1 ||
      requiredIndex === -1 ||
      dependentIndex > requiredIndex
    ) {
      return
    }

    const [dependentPrompt] =
      shuffledPrompts.splice(
        dependentIndex,
        1,
      )

    const updatedRequiredIndex =
      shuffledPrompts.findIndex(
        (item) =>
          item.id === prompt.mustComeAfter,
      )

    shuffledPrompts.splice(
      updatedRequiredIndex + 1,
      0,
      dependentPrompt,
    )
  })

  return shuffledPrompts
}

function createEmptyAnswers(prompts) {
  return prompts.reduce(
    (answers, prompt) => ({
      ...answers,
      [prompt.id]: '',
    }),
    {},
  )
}

function loadCompletedScriptIds() {
  try {
    const storedValue =
      window.localStorage.getItem(
        COMPLETED_STORAGE_KEY,
      )

    if (!storedValue) {
      return []
    }

    const parsedValue =
      JSON.parse(storedValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter((id) =>
      lostScripts.some(
        (script) => script.id === id,
      ),
    )
  } catch {
    return []
  }
}

function saveCompletedScriptIds(ids) {
  try {
    window.localStorage.setItem(
      COMPLETED_STORAGE_KEY,
      JSON.stringify(ids),
    )
  } catch {
    // The game still works when storage is
    // unavailable, but progress will not persist.
  }
}

function chooseRandomScript(
  completedIds = [],
  excludedScriptId = null,
) {
  let availableScripts =
    lostScripts.filter(
      (script) =>
        !completedIds.includes(script.id),
    )

  if (
    excludedScriptId &&
    availableScripts.length > 1
  ) {
    availableScripts =
      availableScripts.filter(
        (script) =>
          script.id !== excludedScriptId,
      )
  }

  if (availableScripts.length === 0) {
    availableScripts = [...lostScripts]
  }

  const randomIndex = Math.floor(
    Math.random() *
      availableScripts.length,
  )

  return availableScripts[randomIndex]
}

function renderParts(parts, answers) {
  return parts.map((part, index) => {
    if (typeof part === 'string') {
      return part
    }

    return (
      <mark
        className="lost-script-answer"
        key={`${part.answerId}-${index}`}
      >
        {answers[part.answerId]}
      </mark>
    )
  })
}

function partsToPlainText(parts, answers) {
  return parts
    .map((part) => {
      if (typeof part === 'string') {
        return part
      }

      return answers[part.answerId] || ''
    })
    .join('')
}

function addWrappedPdfText({
  document,
  text,
  x,
  y,
  maxWidth,
  fontSize = 11,
  lineHeight = 6,
  fontStyle = 'normal',
  leftMargin = 18,
  bottomMargin = 18,
}) {
  document.setFont(
    'helvetica',
    fontStyle,
  )
  document.setFontSize(fontSize)

  const lines =
    document.splitTextToSize(
      text,
      maxWidth,
    )

  let currentY = y

  lines.forEach((line) => {
    if (
      currentY >
      document.internal.pageSize.getHeight() -
        bottomMargin
    ) {
      document.addPage()
      currentY = 20
    }

    document.text(line, x, currentY)
    currentY += lineHeight
  })

  return {
    y: currentY,
    leftMargin,
  }
}

function LostScriptsPage() {
  const initialCompletedIds =
    loadCompletedScriptIds()

  const [phase, setPhase] = useState(
    PHASES.PICKER,
  )

  const [
    completedScriptIds,
    setCompletedScriptIds,
  ] = useState(initialCompletedIds)

  const [
    selectedScript,
    setSelectedScript,
  ] = useState(() =>
    chooseRandomScript(
      initialCompletedIds,
    ),
  )

  const [promptOrder, setPromptOrder] =
    useState([])

  const [answers, setAnswers] =
    useState(() =>
      createEmptyAnswers(
        selectedScript.prompts,
      ),
    )

  const [formError, setFormError] =
    useState('')

  const [
    restoringMessageIndex,
    setRestoringMessageIndex,
  ] = useState(0)

  const completedFieldCount = useMemo(
    () =>
      selectedScript.prompts.filter(
        (prompt) =>
          answers[prompt.id]?.trim(),
      ).length,
    [answers, selectedScript],
  )

  const allFieldsCompleted =
    completedFieldCount ===
    selectedScript.prompts.length

  useEffect(() => {
    if (phase !== PHASES.RESTORING) {
      return undefined
    }

    setRestoringMessageIndex(0)

    const messageInterval =
      window.setInterval(() => {
        setRestoringMessageIndex(
          (currentIndex) =>
            Math.min(
              currentIndex + 1,
              RESTORING_MESSAGES.length -
                1,
            ),
        )
      }, 520)

    const revealTimeout =
      window.setTimeout(() => {
        window.clearInterval(
          messageInterval,
        )

        setPhase(PHASES.REVEAL)

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }, 2700)

    return () => {
      window.clearInterval(
        messageInterval,
      )

      window.clearTimeout(
        revealTimeout,
      )
    }
  }, [phase])

  function resetScriptForm(script) {
    setAnswers(
      createEmptyAnswers(
        script.prompts,
      ),
    )

    setPromptOrder(
      shufflePrompts(
        script.prompts,
      ),
    )

    setFormError('')
  }

  function beginSelectedScript() {
    resetScriptForm(selectedScript)
    setPhase(PHASES.FORM)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function handleAnswerChange(
    promptId,
    value,
  ) {
    setAnswers(
      (currentAnswers) => ({
        ...currentAnswers,
        [promptId]: value,
      }),
    )

    if (formError) {
      setFormError('')
    }
  }

  function restoreScript(event) {
    event.preventDefault()

    if (!allFieldsCompleted) {
      setFormError(
        'Fill in every missing word before restoring the script.',
      )

      return
    }

    setFormError('')
    setPhase(PHASES.RESTORING)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function selectNextScript({
    markCurrentCompleted = false,
    destinationPhase = PHASES.PICKER,
  } = {}) {
    let updatedCompletedIds = [
      ...completedScriptIds,
    ]

    if (
      markCurrentCompleted &&
      !updatedCompletedIds.includes(
        selectedScript.id,
      )
    ) {
      updatedCompletedIds.push(
        selectedScript.id,
      )
    }

    if (
      updatedCompletedIds.length >=
      lostScripts.length
    ) {
      updatedCompletedIds = []
    }

    saveCompletedScriptIds(
      updatedCompletedIds,
    )

    setCompletedScriptIds(
      updatedCompletedIds,
    )

    const nextScript =
      chooseRandomScript(
        updatedCompletedIds,
        selectedScript.id,
      )

    setSelectedScript(nextScript)
    resetScriptForm(nextScript)
    setPhase(destinationPhase)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function returnToPicker() {
    setPhase(PHASES.PICKER)
    setFormError('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function skipCurrentScript() {
    selectNextScript({
      markCurrentCompleted: true,
      destinationPhase: PHASES.PICKER,
    })
  }

  function returnAfterCompletedScript() {
    selectNextScript({
      markCurrentCompleted: true,
      destinationPhase: PHASES.PICKER,
    })
  }

  function startAnotherScript() {
    resetScriptForm(selectedScript)
    setPhase(PHASES.FORM)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function downloadScriptPdf() {
    const document = new jsPDF({
      unit: 'mm',
      format: 'letter',
    })

    const pageWidth =
      document.internal.pageSize.getWidth()

    const leftMargin = 18
    const rightMargin = 18
    const contentWidth =
      pageWidth -
      leftMargin -
      rightMargin

    document.setFont(
      'helvetica',
      'bold',
    )
    document.setFontSize(10)
    document.text(
      'PAUL’S CIGAR LOUNGE PRESENTS',
      pageWidth / 2,
      18,
      {
        align: 'center',
      },
    )

    document.setFontSize(22)
    document.text(
      'LOST SCRIPTS',
      pageWidth / 2,
      29,
      {
        align: 'center',
      },
    )

    document.setFontSize(15)
    document.text(
      selectedScript.title,
      pageWidth / 2,
      39,
      {
        align: 'center',
      },
    )

    document.setFont(
      'helvetica',
      'normal',
    )
    document.setFontSize(10)
    document.text(
      `Recovered Script ${selectedScript.archiveNumber}`,
      pageWidth / 2,
      47,
      {
        align: 'center',
      },
    )

    let y = 60

    selectedScript.blocks.forEach(
      (block) => {
        const text = block.parts
          ? partsToPlainText(
              block.parts,
              answers,
            )
          : block.text

        if (
          block.type ===
          'scene-heading'
        ) {
          y += 3

          const result =
            addWrappedPdfText({
              document,
              text: text.toUpperCase(),
              x: leftMargin,
              y,
              maxWidth: contentWidth,
              fontSize: 11,
              lineHeight: 6,
              fontStyle: 'bold',
            })

          y = result.y + 2
          return
        }

        if (
          block.type ===
          'stage-direction'
        ) {
          const result =
            addWrappedPdfText({
              document,
              text,
              x: leftMargin + 10,
              y,
              maxWidth:
                contentWidth - 20,
              fontSize: 10,
              lineHeight: 5,
              fontStyle: 'italic',
            })

          y = result.y + 2
          return
        }

        if (
          y >
          document.internal.pageSize.getHeight() -
            32
        ) {
          document.addPage()
          y = 20
        }

        document.setFont(
          'helvetica',
          'bold',
        )
        document.setFontSize(10)
        document.text(
          block.speaker,
          pageWidth / 2,
          y,
          {
            align: 'center',
          },
        )

        y += 5

        const result =
          addWrappedPdfText({
            document,
            text,
            x: leftMargin + 28,
            y,
            maxWidth:
              contentWidth - 56,
            fontSize: 10,
            lineHeight: 5,
            fontStyle: 'normal',
          })

        y = result.y + 3
      },
    )

    const safeTitle =
      selectedScript.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

    document.save(
      `${selectedScript.archiveNumber}-${safeTitle}.pdf`,
    )
  }

  return (
    <ActivityLayout
      eyebrow="Apartment 201 Archives"
      title="Lost Scripts"
      description="Supply the missing words and restore a disastrous lost sitcom scene."
      icon={ScrollText}
    >
      {phase === PHASES.PICKER && (
        <section className="lost-scripts-picker">
          <div className="lost-scripts-picker__intro">
            <p className="lost-scripts-picker__label">
              Recovered from Apartment 201
            </p>

            <h2>
              Choose tonight’s missing scene
            </h2>

            <p>
              We recovered ten damaged sitcom
              scripts. Unfortunately, several
              important words are missing.
            </p>
          </div>

          <article className="lost-script-card">
            <div className="lost-script-card__icon">
              <FileText
                aria-hidden="true"
                size={32}
              />
            </div>

            <p className="lost-script-card__number">
              Recovered Script{' '}
              {selectedScript.archiveNumber}
            </p>

            <h3>
              {selectedScript.title}
            </h3>

            <p className="lost-script-card__teaser">
              {selectedScript.teaser}
            </p>

            <div className="lost-script-card__actions">
              <button
                className="lost-script-button lost-script-button--primary"
                type="button"
                onClick={beginSelectedScript}
              >
                <Check
                  aria-hidden="true"
                  size={19}
                />

                Use This Script
              </button>

              <button
                className="lost-script-button lost-script-button--secondary"
                type="button"
                onClick={skipCurrentScript}
              >
                <RefreshCw
                  aria-hidden="true"
                  size={18}
                />

                I’ve Done This One Already
              </button>
            </div>
          </article>

          <p className="lost-scripts-picker__progress">
  {lostScripts.length} lost scripts discovered.{' '}
  {completedScriptIds.length} of{' '}
  {lostScripts.length} completed.
</p>
        </section>
      )}

      {phase === PHASES.FORM && (
        <section className="lost-script-form-screen">
          <button
            className="lost-script-text-button"
            type="button"
            onClick={returnToPicker}
          >
            <ArrowLeft
              aria-hidden="true"
              size={18}
            />

            Choose a different script
          </button>

          <div className="lost-script-form-screen__header">
            <p className="lost-scripts-picker__label">
              {selectedScript.archiveNumber}
            </p>

            <h2>
              {selectedScript.title}
            </h2>

            <p>
              Supply the missing words without
              seeing where they belong. Strange
              answers are strongly encouraged.
            </p>
          </div>

          <form
            className="lost-script-form"
            onSubmit={restoreScript}
          >
            <div className="lost-script-form__progress">
              <span>
                {completedFieldCount} of{' '}
                {selectedScript.prompts.length}{' '}
                words supplied
              </span>

              <div
                aria-hidden="true"
                className="lost-script-form__progress-track"
              >
                <div
                  className="lost-script-form__progress-fill"
                  style={{
                    width: `${
                      (
                        completedFieldCount /
                        selectedScript.prompts
                          .length
                      ) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="lost-script-prompts">
              {promptOrder.map(
                (prompt, index) => (
                  <label
                    className="lost-script-prompt"
                    key={prompt.id}
                  >
                    <span className="lost-script-prompt__number">
                      {index + 1}
                    </span>

                    <span className="lost-script-prompt__content">
                      <strong>
                        {prompt.label}
                      </strong>

                      <span>
                        Example: {prompt.example}
                      </span>

                      <input
                        autoComplete="off"
                        maxLength={60}
                        type="text"
                        value={
                          answers[prompt.id]
                        }
                        onChange={(event) =>
                          handleAnswerChange(
                            prompt.id,
                            event.target.value,
                          )
                        }
                      />
                    </span>
                  </label>
                ),
              )}
            </div>

            {formError && (
              <p
                className="lost-script-form__error"
                role="alert"
              >
                {formError}
              </p>
            )}

            <button
              className="lost-script-restore-button"
              type="submit"
            >
              <Clapperboard
                aria-hidden="true"
                size={21}
              />

              Restore the Lost Script
            </button>
          </form>
        </section>
      )}

      {phase === PHASES.RESTORING && (
        <section
          className="lost-script-restoring"
          aria-live="polite"
        >
          <div className="lost-script-restoring__icon">
            <Sparkles
              aria-hidden="true"
              size={42}
            />
          </div>

          <p className="lost-scripts-picker__label">
            Apartment 201 Archives
          </p>

          <h2>
            Restoring Script...
          </h2>

          <p>
            {
              RESTORING_MESSAGES[
                restoringMessageIndex
              ]
            }
          </p>

          <div
            aria-hidden="true"
            className="lost-script-restoring__track"
          >
            <div className="lost-script-restoring__fill" />
          </div>
        </section>
      )}

      {phase === PHASES.REVEAL && (
        <section className="lost-script-reveal lost-script-reveal-enter">
          <div className="lost-script-reveal__heading">
            <p className="lost-scripts-picker__label">
              Script successfully restored
            </p>

            <h2>
              {selectedScript.title}
            </h2>

            <p>
              Recovered Script{' '}
              {selectedScript.archiveNumber}
            </p>
          </div>

          <article className="lost-script-page">
            <div
              aria-hidden="true"
              className="lost-script-page__stamp"
            >
              Recovered
            </div>

            <header className="lost-script-page__header">
              <p>
                Paul’s Cigar Lounge Presents
              </p>

              <h3>
                Lost Scripts
              </h3>

              <span>
                {selectedScript.title}
              </span>
            </header>

            <div className="lost-script-page__body">
              {selectedScript.blocks.map(
                (block, index) => {
                  const content = block.parts
                    ? renderParts(
                        block.parts,
                        answers,
                      )
                    : block.text

                  if (
                    block.type ===
                    'scene-heading'
                  ) {
                    return (
                      <h4
                        className="lost-script-scene-heading"
                        key={index}
                      >
                        {content}
                      </h4>
                    )
                  }

                  if (
                    block.type ===
                    'stage-direction'
                  ) {
                    return (
                      <p
                        className="lost-script-stage-direction"
                        key={index}
                      >
                        {content}
                      </p>
                    )
                  }

                  return (
                    <div
                      className="lost-script-dialogue"
                      key={index}
                    >
                      <p className="lost-script-dialogue__speaker">
                        {block.speaker}
                      </p>

                      <p>
                        {content}
                      </p>
                    </div>
                  )
                },
              )}
            </div>

            <footer className="lost-script-page__footer">
              <p>
                This script is comedy gold.
                You’d better save it.
              </p>

              <button
                className="lost-script-button lost-script-button--primary"
                type="button"
                onClick={downloadScriptPdf}
              >
                <Download
                  aria-hidden="true"
                  size={18}
                />

                Download Script PDF
              </button>
            </footer>
          </article>

          <div className="lost-script-reveal__actions">
            <button
              className="lost-script-button lost-script-button--primary"
              type="button"
              onClick={startAnotherScript}
            >
              <RefreshCw
                aria-hidden="true"
                size={18}
              />

              Try This Script Again
            </button>

            <button
              className="lost-script-button lost-script-button--secondary"
              type="button"
              onClick={returnAfterCompletedScript}
            >
              <ArrowLeft
                aria-hidden="true"
                size={18}
              />

              Return to Lost Scripts
            </button>
          </div>
        </section>
      )}
    </ActivityLayout>
  )
}

export default LostScriptsPage