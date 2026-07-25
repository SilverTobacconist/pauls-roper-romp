import { ArrowLeft, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

function ActivityLayout({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
}) {
  return (
    <main className="activity-page">
      <div className="activity-page__background" />

      <header className="activity-page__header">
        <Link className="activity-page__back" to="/?view=menu">
          <ArrowLeft aria-hidden="true" size={20} />
          Back to Apartment 201
        </Link>

        <Link
          className="activity-page__home"
          to="/?view=menu"
          aria-label="Return to the homepage"
        >
          <Home aria-hidden="true" size={22} />
        </Link>
      </header>

      <section className="activity-page__content">
        <div className="activity-page__icon">
          <Icon aria-hidden="true" size={34} strokeWidth={1.8} />
        </div>

        <p className="activity-page__eyebrow">{eyebrow}</p>

        <h1>{title}</h1>

        <p className="activity-page__description">
          {description}
        </p>

        <div className="activity-page__panel">
          {children}
        </div>
      </section>
    </main>
  )
}

export default ActivityLayout