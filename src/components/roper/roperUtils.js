export const MAX_RECORDING_SECONDS = 15;

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

export function getReservationId(claimResult) {
  return (
    claimResult?.reservation_id ||
    claimResult?.reservationId ||
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
      typeof MediaRecorder.isTypeSupported !== "function" ||
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
  return Math.max(0, Number(seconds) || 0).toFixed(1);
}