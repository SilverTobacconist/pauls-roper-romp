import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { forceRoperReveal, getAdminDashboard, moderateReview, requestAdminLink, signOutAdmin, verifyAdminCode } from '../lib/roperAdmin'
import { supabase } from '../lib/supabase'

function Login() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [message, setMessage] = useState('')
  async function submit(event) {
    event.preventDefault()
    try { await requestAdminLink(email); setCodeSent(true); setMessage('Enter the verification code from your email.') } catch (error) { setMessage(error.message) }
  }
  async function verify(event) {
    event.preventDefault()
    try { await verifyAdminCode(email, code); setMessage('Verified.  Opening the control room…') } catch (error) { setMessage(error.message) }
  }
  return <main className="admin-page"><section className="admin-card"><p>Apartment 201 Control Room</p><h1>Admin login</h1>{!codeSent ? <form onSubmit={submit}><input type="email" required placeholder="Admin email" value={email} onChange={(event) => setEmail(event.target.value)} /><button>Send verification code</button></form> : <form onSubmit={verify}><p>Code sent to {email}.</p><input inputMode="numeric" autoComplete="one-time-code" required placeholder="Verification code" value={code} onChange={(event) => setCode(event.target.value)} /><button>Verify and enter</button><button type="button" onClick={() => setCodeSent(false)}>Use a different email</button></form>}{message && <small>{message}</small>}<Link to="/">Return to the public site</Link></section></main>
}

function Dashboard({ data, refresh }) {
  const [message, setMessage] = useState('')
  async function moderate(id, action) { try { await moderateReview(id, action); await refresh() } catch (error) { setMessage(error.message) } }
  async function reveal() { if (!window.confirm('Unlock the Mr. Roper Hear? reveal for all visitors now?')) return; try { await forceRoperReveal(); setMessage('The reveal is now unlocked.'); } catch (error) { setMessage(error.message) } }
  return <main className="admin-page"><section className="admin-dashboard"><header><div><p>Apartment 201 Control Room</p><h1>Roper Romp Admin</h1></div><div><button onClick={() => window.open('/?view=menu', '_blank')}>View public site</button><button onClick={() => signOutAdmin().then(() => window.location.reload())}>Log out</button></div></header>{message && <p className="admin-message">{message}</p>}<section><h2>Emergency controls</h2><button className="admin-warning" onClick={reveal}>Force-unlock “What Did Mr. Roper Hear?”</button><p>Use only if the scheduled 7:00 p.m. reveal has not opened.</p></section><section><h2>Pending Critic’s Choice reviews ({data.pending_reviews.length})</h2>{data.pending_reviews.length ? data.pending_reviews.map((review) => <article className="admin-review" key={review.id}><strong>{review.rating}★ — {review.subject}</strong><span>by {review.display_name} · {review.category}</span><p>{review.review}</p><button onClick={() => moderate(review.id, 'approved')}>Approve</button><button onClick={() => moderate(review.id, 'rejected')}>Reject</button></article>) : <p>No reviews await Stanley’s stamp of approval.</p>}</section><section><h2>Visitor counts</h2><div className="admin-table"><div><strong>Page</strong><strong>Visits</strong><strong>Unique visitors</strong></div>{data.page_visits.map((visit) => <div key={visit.path}><span>{visit.path === '/' ? 'Homepage' : visit.path}</span><span>{visit.total_visits}</span><span>{visit.unique_visitors}</span></div>)}</div></section><section><h2>Email subscribers ({data.subscribers.length})</h2><div className="subscriber-list">{data.subscribers.map((subscriber) => <div key={subscriber.id}><span>{subscriber.email}</span><time>{new Date(subscriber.subscribed_at).toLocaleString()}</time></div>) || <p>None yet.</p>}</div></section></section></main>
}

export default function AdminPage() {
  const [session, setSession] = useState(undefined)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  async function refresh() { try { setData(await getAdminDashboard()); setError('') } catch (err) { setError(err.message) } }
  useEffect(() => { supabase.auth.getSession().then(({ data: result }) => setSession(result.session)); const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next)); return () => listener.subscription.unsubscribe() }, [])
  useEffect(() => {
    if (!session) return undefined
    const timer = window.setTimeout(() => { refresh() }, 0)
    return () => window.clearTimeout(timer)
  }, [session])
  if (session === undefined) return null
  if (!session) return <Login />
  if (error) return <main className="admin-page"><section className="admin-card"><h1>Access denied</h1><p>{error}</p><button onClick={() => signOutAdmin().then(() => window.location.reload())}>Use a different email</button></section></main>
  if (!data) return <main className="admin-page"><section className="admin-card">Opening the control room…</section></main>
  return <Dashboard data={data} refresh={refresh} />
}
