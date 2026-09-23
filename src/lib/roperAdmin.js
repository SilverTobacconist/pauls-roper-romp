import { supabase } from './supabase'

export async function requestAdminLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { shouldCreateUser: false },
  })
  if (error) throw error
}

export async function verifyAdminCode(email, code) {
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: code.trim(),
    type: 'email',
  })
  if (error) throw error
}

export async function getAdminDashboard() {
  const { data, error } = await supabase.rpc('get_roper_admin_dashboard')
  if (error) throw error
  return data
}

export async function moderateReview(id, action) {
  const { error } = await supabase.rpc('moderate_roper_review', {
    p_review_id: id,
    p_action: action,
  })
  if (error) throw error
}

export async function forceRoperReveal() {
  const { error } = await supabase.rpc('force_roper_reveal')
  if (error) throw error
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
