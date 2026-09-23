import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { getRoperSessionId } from '../lib/roperSession'
import { supabase } from '../lib/supabase'

export default function RoperVisitTracker() {
  const location = useLocation()

  useEffect(() => {
    if (!['/', '/reviews', '/mr-roper-heard', '/lost-scripts', '/rent-calculator'].includes(location.pathname)) {
      return
    }
    supabase.rpc('record_roper_page_visit', {
      p_page_path: location.pathname,
      p_visitor_session_id: getRoperSessionId(),
    }).then(({ error }) => {
      if (error) console.error('Visit count was not recorded:', error)
    })
  }, [location.pathname])

  return null
}
