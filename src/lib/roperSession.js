const ROPER_SESSION_STORAGE_KEY = "pauls_roper_session_id";

/**
 * Returns the browser's persistent Roper participant session ID.
 *
 * The same ID survives refreshes and browser restarts so an active
 * reservation can be resumed until it expires.
 */
export function getRoperSessionId() {
  const existingSessionId = localStorage.getItem(
    ROPER_SESSION_STORAGE_KEY
  );

  if (existingSessionId) {
    return existingSessionId;
  }

  const newSessionId = crypto.randomUUID();

  localStorage.setItem(
    ROPER_SESSION_STORAGE_KEY,
    newSessionId
  );

  return newSessionId;
}

/**
 * Removes the local Roper session ID.
 *
 * This should normally only be used during development or after an
 * administrative reset. Do not clear it whenever someone leaves the
 * activity because the stable ID is what allows reservation recovery.
 */
export function clearRoperSessionId() {
  localStorage.removeItem(ROPER_SESSION_STORAGE_KEY);
}

/**
 * Returns the localStorage key for debugging or development utilities.
 */
export function getRoperSessionStorageKey() {
  return ROPER_SESSION_STORAGE_KEY;
}