import { supabase } from "./supabase";
import { getRoperSessionId } from "./roperSession";

const ROPER_AUDIO_BUCKET = "roper-audio";

/**
 * Throws a normalized Error when a Supabase request fails.
 */
function throwSupabaseError(error, fallbackMessage) {
  if (!error) {
    return;
  }

  console.error(fallbackMessage, error);

  throw new Error(
    error.message ||
      fallbackMessage ||
      "An unexpected Supabase error occurred."
  );
}

/**
 * Returns the current activity mode and activity-card copy.
 *
 * Expected modes:
 * - play
 * - reveal
 */
export async function getRoperActivityState() {
  const { data, error } = await supabase.rpc(
    "get_roper_activity_state"
  );

  throwSupabaseError(
    error,
    "Could not load the Roper activity state."
  );

  return data;
}

/**
 * Claims the next available turn or resumes this browser's
 * existing reservation.
 *
 * Expected statuses:
 * - claimed
 * - resumed
 * - waiting
 * - reveal
 * - unavailable
 */
export async function claimRoperTurn() {
  const sessionId = getRoperSessionId();

  const { data, error } = await supabase.rpc(
    "claim_roper_turn",
    {
      p_session_id: sessionId,
    }
  );

  throwSupabaseError(
    error,
    "Could not claim a Roper turn."
  );

  return data;
}

/**
 * Retrieves the authoritative database state for an active turn.
 */
export async function getRoperTurnState(reservationId) {
  const sessionId = getRoperSessionId();

  const { data, error } = await supabase.rpc(
    "get_roper_turn_state",
    {
      p_reservation_id: reservationId,
      p_session_id: sessionId,
    }
  );

  throwSupabaseError(
    error,
    "Could not load the current Roper turn."
  );

  return data;
}

/**
 * Extends the reservation while the participant is actively
 * using the screen.
 */
export async function extendRoperReservation(
  reservationId
) {
  const sessionId = getRoperSessionId();

  const { data, error } = await supabase.rpc(
    "extend_roper_reservation",
    {
      p_reservation_id: reservationId,
      p_session_id: sessionId,
    }
  );

  throwSupabaseError(
    error,
    "Could not extend the Roper reservation."
  );

  return data;
}

/**
 * Returns the waiting-room state for this browser.
 *
 * Expected statuses:
 * - available
 * - waiting
 * - your_turn
 * - reveal
 */
export async function getRoperWaitingState() {
  const sessionId = getRoperSessionId();

  const { data, error } = await supabase.rpc(
    "get_roper_waiting_state",
    {
      p_session_id: sessionId,
    }
  );

  throwSupabaseError(
    error,
    "Could not check the Roper waiting room."
  );

  return data;
}

/**
 * Authorizes the one permitted playback of the previous recording.
 *
 * Turns 2 through 5 only.
 */
export async function startRoperPlayback(
  reservationId
) {
  const sessionId = getRoperSessionId();

  const { data, error } = await supabase.rpc(
    "start_roper_playback",
    {
      p_reservation_id: reservationId,
      p_session_id: sessionId,
    }
  );

  throwSupabaseError(
    error,
    "Could not start the previous recording."
  );

  return data;
}

/**
 * Marks the previous recording as fully played.
 */
export async function completeRoperPlayback(
  reservationId
) {
  const sessionId = getRoperSessionId();

  const { data, error } = await supabase.rpc(
    "complete_roper_playback",
    {
      p_reservation_id: reservationId,
      p_session_id: sessionId,
    }
  );

  throwSupabaseError(
    error,
    "Could not complete playback."
  );

  return data;
}

/**
 * Saves and permanently locks the phrase typed by a participant.
 *
 * Turns 2 through 5 only.
 */
export async function submitRoperTypedPhrase(
  reservationId,
  typedPhrase
) {
  const sessionId = getRoperSessionId();

  const normalizedPhrase = typedPhrase.trim();

  if (!normalizedPhrase) {
    throw new Error(
      "Type what you heard before submitting."
    );
  }

  if (normalizedPhrase.length > 300) {
    throw new Error(
      "The misunderstanding cannot exceed 300 characters."
    );
  }

  const { data, error } = await supabase.rpc(
    "submit_roper_typed_phrase",
    {
      p_reservation_id: reservationId,
      p_session_id: sessionId,
      p_typed_phrase: normalizedPhrase,
    }
  );

  throwSupabaseError(
    error,
    "Could not submit the typed phrase."
  );

  return data;
}

/**
 * Authorizes the participant's one recording attempt.
 *
 * Turns 1 through 4 only.
 */
export async function startRoperRecording(
  reservationId,
  fileExtension = "webm"
) {
  const sessionId = getRoperSessionId();

  const { data, error } = await supabase.rpc(
    "start_roper_recording",
    {
      p_reservation_id: reservationId,
      p_session_id: sessionId,
      p_file_extension: fileExtension,
    }
  );

  throwSupabaseError(
    error,
    "Could not authorize the recording."
  );

  return data;
}

/**
 * Uploads an audio Blob to the exact path authorized by the database.
 *
 * Upsert remains disabled so the recording cannot be replaced.
 */
export async function uploadRoperRecording(
  audioPath,
  audioBlob
) {
  if (!audioPath) {
    throw new Error(
      "The recording upload path is missing."
    );
  }

  if (!(audioBlob instanceof Blob)) {
    throw new Error(
      "The recording data is invalid."
    );
  }

  const contentType =
    audioBlob.type || "audio/webm";

  const { data, error } = await supabase.storage
    .from(ROPER_AUDIO_BUCKET)
    .upload(audioPath, audioBlob, {
      contentType,
      upsert: false,
      cacheControl: "3600",
    });

  throwSupabaseError(
    error,
    "Could not upload the recording."
  );

  return data;
}

/**
 * Permanently completes a recorded turn after its audio upload.
 *
 * Turns 1 through 4 only.
 */
export async function completeRoperRecording(
  reservationId,
  audioDurationSeconds
) {
  const sessionId = getRoperSessionId();

  const duration = Number(audioDurationSeconds);

  if (!Number.isFinite(duration)) {
    throw new Error(
      "The recording duration is invalid."
    );
  }

  const { data, error } = await supabase.rpc(
    "complete_roper_recording",
    {
      p_reservation_id: reservationId,
      p_session_id: sessionId,
      p_audio_duration_seconds: duration,
    }
  );

  throwSupabaseError(
    error,
    "Could not complete the recorded turn."
  );

  return data;
}

/**
 * Completes Turn 5, which contains text but no recording.
 */
export async function completeRoperFinalTurn(
  reservationId
) {
  const sessionId = getRoperSessionId();

  const { data, error } = await supabase.rpc(
    "complete_roper_final_turn",
    {
      p_reservation_id: reservationId,
      p_session_id: sessionId,
    }
  );

  throwSupabaseError(
    error,
    "Could not complete the final misunderstanding."
  );

  return data;
}

/**
 * Abandons an unfinished reservation.
 *
 * Any partial progress is discarded and the same position becomes
 * available to another participant.
 */
export async function abandonRoperTurn(
  reservationId
) {
  const sessionId = getRoperSessionId();

  const { data, error } = await supabase.rpc(
    "abandon_roper_turn",
    {
      p_reservation_id: reservationId,
      p_session_id: sessionId,
    }
  );

  throwSupabaseError(
    error,
    "Could not release the Roper turn."
  );

  return data;
}

/**
 * Returns completed conversation chains after reveal time.
 */
export async function getRoperReveal() {
  const { data, error } = await supabase.rpc(
    "get_roper_reveal"
  );

  throwSupabaseError(
    error,
    "Could not load the Roper reveal."
  );

  return data;
}

/**
 * Creates a temporary signed URL for a private audio file.
 */
export async function createRoperSignedAudioUrl(
  audioPath,
  expiresInSeconds = 45
) {
  if (!audioPath) {
    throw new Error(
      "The requested audio path is missing."
    );
  }

  const expiration = Math.max(
    1,
    Math.floor(Number(expiresInSeconds))
  );

  const { data, error } = await supabase.storage
    .from(ROPER_AUDIO_BUCKET)
    .createSignedUrl(audioPath, expiration);

  throwSupabaseError(
    error,
    "Could not create the private audio link."
  );

  if (!data?.signedUrl) {
    throw new Error(
      "Supabase did not return a signed audio URL."
    );
  }

  return data.signedUrl;
}

/**
 * Creates the waiting-room Realtime subscription.
 *
 * The callback is only a wake-up signal. The page must still call
 * getRoperWaitingState() or claimRoperTurn() to determine access.
 */
export function subscribeToRoperWaitingRoom(
  onDatabaseChange
) {
  if (typeof onDatabaseChange !== "function") {
    throw new Error(
      "A waiting-room callback is required."
    );
  }

  return supabase
    .channel(`roper-waiting-${crypto.randomUUID()}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "roper_turn_reservations",
      },
      onDatabaseChange
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "roper_conversations",
      },
      onDatabaseChange
    )
    .subscribe();
}

/**
 * Removes a previously created Realtime channel.
 */
export async function unsubscribeFromRoperChannel(
  channel
) {
  if (!channel) {
    return;
  }

  await supabase.removeChannel(channel);
}