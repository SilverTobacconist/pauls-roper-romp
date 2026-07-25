import { useMemo, useState } from 'react'
import {
  Calculator,
  CircleMinus,
  CirclePlus,
  ReceiptText,
  RotateCcw,
} from 'lucide-react'

import ActivityLayout from '../../layouts/ActivityLayout'

const BASE_RENT = 600

const counterFields = [
  {
    key: 'roommates',
    label: 'Roommates',
    description: 'Stanley only approved one of you.',
    minimum: 1,
    maximum: 4,
    price: 125,
    freeAmount: 1,
    chargeLabel: 'Unauthorized roommate surcharge',
  },
  {
    key: 'parties',
    label: 'Parties This Month',
    description: 'Any gathering louder than Stanley’s television.',
    minimum: 0,
    maximum: 10,
    price: 75,
    freeAmount: 0,
    chargeLabel: 'Unapproved party fee',
  },
  {
    key: 'brokenLamps',
    label: 'Broken Lamps',
    description: 'They were perfectly good lamps before you moved in.',
    minimum: 0,
    maximum: 10,
    price: 38,
    freeAmount: 0,
    chargeLabel: 'Lamp replacement charge',
  },
  {
    key: 'larryVisits',
    label: 'Larry Visits',
    description: 'Stanley does not trust that man near the building.',
    minimum: 0,
    maximum: 10,
    price: 45,
    freeAmount: 0,
    chargeLabel: 'Larry proximity surcharge',
  },
  {
    key: 'noiseComplaints',
    label: 'Noise Complaints',
    description: 'Laughter after 9 PM is apparently structural damage.',
    minimum: 0,
    maximum: 10,
    price: 90,
    freeAmount: 0,
    chargeLabel: 'Excessive happiness penalty',
  },
]

const initialCounters = {
  roommates: 1,
  parties: 0,
  brokenLamps: 0,
  larryVisits: 0,
  noiseComplaints: 0,
}

function formatMoney(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

function getVerdict(total) {
  if (total <= 450) {
    return {
      title: 'Helen Got Involved',
      description:
        'Stanley hates this number, which means Helen probably approved it.',
    }
  }

  if (total <= 750) {
    return {
      title: 'Suspiciously Reasonable',
      description:
        'Stanley will accept it, but only after checking the lease three times.',
    }
  }

  if (total <= 1100) {
    return {
      title: 'You’re Testing Him',
      description:
        'Stanley has begun pacing, muttering, and calculating late fees.',
    }
  }

  if (total <= 1500) {
    return {
      title: 'Apartment 201 Is Under Investigation',
      description:
        'No one is entirely certain what happened, but Larry was probably nearby.',
    }
  }

  return {
    title: 'Stanley Has Called a Meeting',
    description:
      'Bring the rent, the broken lamp, and a convincing explanation for everything.',
  }
}

function RentCalculatorPage() {
  const [counters, setCounters] = useState(initialCounters)
  const [helenLikesYou, setHelenLikesYou] = useState(false)
  const [jackCooked, setJackCooked] = useState(false)
  const [paidEarly, setPaidEarly] = useState(false)
  const [claimedToBeCousin, setClaimedToBeCousin] = useState(false)

  const calculation = useMemo(() => {
    const lineItems = [
      {
        label: 'Base monthly rent',
        amount: BASE_RENT,
      },
    ]

    counterFields.forEach((field) => {
      const chargeableAmount = Math.max(
        0,
        counters[field.key] - field.freeAmount,
      )

      if (chargeableAmount > 0) {
        lineItems.push({
          label: `${field.chargeLabel} × ${chargeableAmount}`,
          amount: chargeableAmount * field.price,
        })
      }
    })

    if (claimedToBeCousin) {
      lineItems.push({
        label: 'Suspicious cousin explanation',
        amount: 125,
      })
    }

    if (jackCooked) {
      lineItems.push({
        label: 'Jack cooked dinner',
        amount: -35,
      })
    }

    if (paidEarly) {
      lineItems.push({
        label: 'Paid before Stanley had to ask',
        amount: -50,
      })
    }

    const subtotal = lineItems.reduce(
      (total, item) => total + item.amount,
      0,
    )

    if (helenLikesYou) {
      lineItems.push({
        label: 'Helen’s secret discount',
        amount: -Math.round(subtotal * 0.2),
      })
    }

    const total = Math.max(
      0,
      lineItems.reduce(
        (runningTotal, item) => runningTotal + item.amount,
        0,
      ),
    )

    return {
      lineItems,
      total,
      verdict: getVerdict(total),
    }
  }, [
    counters,
    claimedToBeCousin,
    helenLikesYou,
    jackCooked,
    paidEarly,
  ])

  function changeCounter(key, amount) {
    const field = counterFields.find((item) => item.key === key)

    setCounters((currentCounters) => ({
      ...currentCounters,
      [key]: Math.min(
        field.maximum,
        Math.max(
          field.minimum,
          currentCounters[key] + amount,
        ),
      ),
    }))
  }

  function resetCalculator() {
    setCounters(initialCounters)
    setHelenLikesYou(false)
    setJackCooked(false)
    setPaidEarly(false)
    setClaimedToBeCousin(false)
  }

  return (
    <ActivityLayout
      eyebrow="Stanley’s Financial Department"
      title="Stanley’s Rent Calculator"
      description="Calculate your rent after parties, broken lamps, suspicious visitors, and unauthorized laughter."
      icon={Calculator}
    >
      <div className="rent-calculator">
        <section className="rent-calculator__controls">
          <div className="rent-section-heading">
            <p className="rent-section-heading__eyebrow">
              Monthly Incident Report
            </p>

            <h2>What happened in Apartment 201?</h2>

            <p>
              Adjust the numbers below. Stanley will adjust your rent
              with the compassion and restraint for which landlords
              are famous.
            </p>
          </div>

          <div className="rent-counter-list">
            {counterFields.map((field) => (
              <div className="rent-counter" key={field.key}>
                <div className="rent-counter__copy">
                  <h3>{field.label}</h3>
                  <p>{field.description}</p>
                </div>

                <div
                  className="rent-counter__buttons"
                  aria-label={`${field.label}: ${counters[field.key]}`}
                >
                  <button
                    type="button"
                    aria-label={`Decrease ${field.label}`}
                    disabled={
                      counters[field.key] <= field.minimum
                    }
                    onClick={() =>
                      changeCounter(field.key, -1)
                    }
                  >
                    <CircleMinus aria-hidden="true" size={22} />
                  </button>

                  <span>{counters[field.key]}</span>

                  <button
                    type="button"
                    aria-label={`Increase ${field.label}`}
                    disabled={
                      counters[field.key] >= field.maximum
                    }
                    onClick={() =>
                      changeCounter(field.key, 1)
                    }
                  >
                    <CirclePlus aria-hidden="true" size={22} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rent-checkbox-list">
            <label className="rent-checkbox">
              <input
                type="checkbox"
                checked={claimedToBeCousin}
                onChange={(event) =>
                  setClaimedToBeCousin(event.target.checked)
                }
              />

              <span>
                <strong>Someone claimed to be Jack’s cousin.</strong>
                <small>
                  Stanley has heard this explanation before.
                </small>
              </span>
            </label>

            <label className="rent-checkbox">
              <input
                type="checkbox"
                checked={jackCooked}
                onChange={(event) =>
                  setJackCooked(event.target.checked)
                }
              />

              <span>
                <strong>Jack cooked dinner.</strong>
                <small>
                  A small credit, assuming the kitchen survived.
                </small>
              </span>
            </label>

            <label className="rent-checkbox">
              <input
                type="checkbox"
                checked={paidEarly}
                onChange={(event) =>
                  setPaidEarly(event.target.checked)
                }
              />

              <span>
                <strong>You paid early.</strong>
                <small>
                  Stanley is confused but willing to reward it.
                </small>
              </span>
            </label>

            <label className="rent-checkbox">
              <input
                type="checkbox"
                checked={helenLikesYou}
                onChange={(event) =>
                  setHelenLikesYou(event.target.checked)
                }
              />

              <span>
                <strong>Helen likes you.</strong>
                <small>
                  She quietly removed twenty percent before Stanley
                  noticed.
                </small>
              </span>
            </label>
          </div>
        </section>

        <aside className="rent-receipt">
          <div className="rent-receipt__heading">
            <ReceiptText aria-hidden="true" size={30} />

            <div>
              <p>Roper Property Management</p>
              <h2>Monthly Statement</h2>
            </div>
          </div>

          <div className="rent-receipt__line-items">
            {calculation.lineItems.map((item) => (
              <div
                className="rent-receipt__line"
                key={item.label}
              >
                <span>{item.label}</span>

                <strong
                  className={
                    item.amount < 0
                      ? 'rent-receipt__discount'
                      : ''
                  }
                >
                  {item.amount < 0 ? '−' : ''}
                  {formatMoney(Math.abs(item.amount))}
                </strong>
              </div>
            ))}
          </div>

          <div className="rent-receipt__total">
            <span>Total Due</span>
            <strong>{formatMoney(calculation.total)}</strong>
          </div>

          <div className="rent-verdict">
            <p>Stanley’s Verdict</p>
            <h3>{calculation.verdict.title}</h3>
            <span>{calculation.verdict.description}</span>
          </div>

          <button
            className="rent-reset-button"
            type="button"
            onClick={resetCalculator}
          >
            <RotateCcw aria-hidden="true" size={18} />
            Reset Stanley’s Math
          </button>
        </aside>
      </div>
    </ActivityLayout>
  )
}

export default RentCalculatorPage