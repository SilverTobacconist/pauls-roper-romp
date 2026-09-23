import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function HomepageVisitorCount() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      supabase.rpc('get_roper_homepage_visitor_count').then(({ data, error }) => {
        if (!error) setCount(data?.unique_visitors ?? 0)
      })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [])

  if (count === null) return null
  return <p className="visitor-count">Apartment 201 has welcomed <strong>{count}</strong> visitor{count === 1 ? '' : 's'}.</p>
}
