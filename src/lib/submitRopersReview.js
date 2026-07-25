import { supabase } from './supabase'

export async function submitRopersReview({
  displayName,
  subject,
  category,
  rating,
  review,
}) {
  const reviewRow = {
    display_name: displayName.trim(),
    subject: subject.trim(),
    category,
    rating: Number(rating),
    review: review.trim(),
    status: 'pending',
    approved_at: null,
  }

  const { error } = await supabase
    .from('ropers_reviews')
    .insert(reviewRow)

  if (error) {
    console.error('Roper review submission failed:', error)
    throw error
  }
}