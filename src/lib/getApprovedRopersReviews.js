import { supabase } from './supabase'

export async function getApprovedRopersReviews() {
  const { data, error } = await supabase
    .from('ropers_reviews')
    .select(
      `
        id,
        created_at,
        display_name,
        subject,
        category,
        rating,
        review
      `,
    )
    .eq('status', 'approved')
    .order('approved_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error(
      'Approved Ropers reviews could not be loaded:',
      error,
    )

    throw error
  }

  return data ?? []
}