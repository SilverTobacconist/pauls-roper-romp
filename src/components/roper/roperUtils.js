export const MAX_RECORDING_SECONDS = 15;
export const MAX_TYPED_PHRASE_LENGTH = 300;

export const PAGE_STATES = {
  LOADING: "loading",
  ACTIVE_TURN: "active-turn",
  WAITING: "waiting",
  REVEAL: "reveal",
  UNAVAILABLE: "unavailable",
  ERROR: "error",
  COMPLETED: "completed",
};

export function getClaimStatus(claimResult) {
  return claimResult?.status || claimResult?.mode || null;
}

export function getReservationId(turnResult) {
  return (
    turnResult?.reservation_id ||
    turnResult?.reservationId ||
    null
  );
}

export function getTurnNumber(turnResult) {
  const value =
    turnResult?.turn_number ??
    turnResult?.turnNumber;

  const turnNumber = Number(value);

  return Number.isFinite(turnNumber)
    ? turnNumber
    : null;
}

export function getConversationNumber(turnResult) {
  const value =
    turnResult?.conversation_number ??
    turnResult?.conversationNumber;

  const conversationNumber = Number(value);

  return Number.isFinite(conversationNumber)
    ? conversationNumber
    : null;
}

export function getCharacterName(turnResult) {
  return (
    turnResult?.character_name ||
    turnResult?.characterName ||
    null
  );
}

export function getOriginalPhrase(turnResult) {
  return (
    turnResult?.original_phrase ||
    turnResult?.originalPhrase ||
    null
  );
}

export function getPreviousAudioPath(turnResult) {
  return (
    turnResult?.previous_audio_path ||
    turnResult?.previousAudioPath ||
    turnResult?.source_audio_path ||
    turnResult?.sourceAudioPath ||
    turnResult?.audio_path ||
    turnResult?.audioPath ||
    null
  );
}

export function getAuthorizedAudioPath(recordingResult) {
  return (
    recordingResult?.audio_path ||
    recordingResult?.audioPath ||
    recordingResult?.storage_path ||
    recordingResult?.storagePath ||
    recordingResult?.upload_path ||
    recordingResult?.uploadPath ||
    null
  );
}

export function getPlaybackAudioPath(playbackResult) {
  return (
    playbackResult?.audio_path ||
    playbackResult?.audioPath ||
    playbackResult?.previous_audio_path ||
    playbackResult?.previousAudioPath ||
    playbackResult?.source_audio_path ||
    playbackResult?.sourceAudioPath ||
    null
  );
}

export function getSupportedRecordingOptions() {
  if (
    typeof window === "undefined" ||
    typeof MediaRecorder === "undefined"
  ) {
    return {
      mimeType: "",
      fileExtension: "webm",
    };
  }

  const candidates = [
    {
      mimeType: "audio/webm;codecs=opus",
      fileExtension: "webm",
    },
    {
      mimeType: "audio/webm",
      fileExtension: "webm",
    },
    {
      mimeType: "audio/mp4",
      fileExtension: "mp4",
    },
  ];

  const supportedCandidate = candidates.find(
    ({ mimeType }) =>
      typeof MediaRecorder.isTypeSupported !==
        "function" ||
      MediaRecorder.isTypeSupported(mimeType)
  );

  return (
    supportedCandidate || {
      mimeType: "",
      fileExtension: "webm",
    }
  );
}

export function formatSeconds(seconds) {
  return Math.max(
    0,
    Number(seconds) || 0
  ).toFixed(1);
}