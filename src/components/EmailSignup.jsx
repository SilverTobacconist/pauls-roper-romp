import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function EmailSignup() {
  const [email, setEmail] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    if (!agreed) {
      setMessage('Please confirm that you would like to receive Paul’s emails.')
      return
    }
    const { error } = await supabase.rpc('subscribe_to_roper_email_list', {
      p_email: email,
    })
    setMessage(error ? error.message : 'You’re on the list.  No daily carrier pigeons, we promise.')
    if (!error) setEmail('')
  }

  return <form className="email-signup" onSubmit={handleSubmit}>
    <strong>Join Paul’s email list</strong>
    <span>New cocktails, cigar events, and lounge news—usually just once or twice a month.</span>
    <div className="email-signup__line">
      <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" aria-label="Email address" />
      <button type="submit">Join the list</button>
    </div>
    <label><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /> I agree to receive marketing emails from Paul’s Cigar Lounge.</label>
    {message && <small role="status">{message}</small>}
  </form>
}
