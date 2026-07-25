import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CheckCircle2,
  Ear,
  LoaderCircle,
  Mic,
  Play,
  Square,
  Upload,
} from "lucide-react";

import ActivityLayout from "../../layouts/ActivityLayout";

import {
  claimRoperTurn,
  completeRoperRecording,
  getRoperActivityState,
  startRoperRecording,
  uploadRoperRecording,
} from "../../lib/roperService";

const MAX_RECORDING_SECONDS = 15;

const PAGE_STATES = {
  LOADING: "loading",
  ACTIVE_TURN: "active-turn",
  WAITING: "waiting",
  REVEAL: "reveal",
  UNAVAILABLE: "unavailable",
  ERROR: "error",
  COMPLETED: "completed",
};

const RECORDING_STATES = {
  READY: "ready",
  REQUESTING_PERMISSION: "requesting-permission",
  RECORDING: "recording",
  RECORDED: "recorded",
  SUBMITTING: "submitting",
};

function getClaimStatus(claimResult) {
  return claimResult?.status || claimResult?.mode || null;
}

function getReservationId(claimResult) {
  return (
    claimResult?.reservation_id ||
    claimResult?.reservationId ||
    null
  );
}

function getAuthorizedAudioPath(recordingResult) {
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

function getSupportedRecordingOptions() {
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

function formatSeconds(seconds) {
  return Math.max(0, Number(seconds) || 0).toFixed(1);
}

function MrRoperHeardPage() {
  const [pageState, setPageState] = useState(
    PAGE_STATES.LOADING
  );

  const [activityState, setActivityState] =
    useState(null);

  const [claimResult, setClaimResult] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [recordingState, setRecordingState] =
    useState(RECORDING_STATES.READY);

  const [recordingError, setRecordingError] =
    useState("");

  const [elapsedSeconds, setElapsedSeconds] =
    useState(0);

  const [audioBlob, setAudioBlob] = useState(null);

  const [audioUrl, setAudioUrl] = useState("");

  const [audioDurationSeconds, setAudioDurationSeconds] =
    useState(0);

  const [completionResult, setCompletionResult] =
    useState(null);

  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingStartedAtRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const automaticStopTimeoutRef = useRef(null);
  const recordingAttemptStartedRef = useRef(false);
  const authorizedAudioPathRef = useRef(null);

  const clearRecordingTimers = useCallback(() => {
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (automaticStopTimeoutRef.current) {
      window.clearTimeout(
        automaticStopTimeoutRef.current
      );

      automaticStopTimeoutRef.current = null;
    }
  }, []);

  const stopMediaStream = useCallback(() => {
    if (!mediaStreamRef.current) {
      return;
    }

    mediaStreamRef.current
      .getTracks()
      .forEach((track) => track.stop());

    mediaStreamRef.current = null;
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function initializeRoperActivity() {
      try {
        setPageState(PAGE_STATES.LOADING);
        setErrorMessage("");

        const currentActivityState =
          await getRoperActivityState();

        if (isCancelled) {
          return;
        }

        setActivityState(currentActivityState);

        if (currentActivityState?.mode === "reveal") {
          setPageState(PAGE_STATES.REVEAL);
          return;
        }

        const currentClaimResult =
          await claimRoperTurn();

        if (isCancelled) {
          return;
        }

        setClaimResult(currentClaimResult);

        const claimStatus =
          getClaimStatus(currentClaimResult);

        switch (claimStatus) {
          case "claimed":
          case "resumed":
          case "your_turn":
            setPageState(PAGE_STATES.ACTIVE_TURN);
            break;

          case "waiting":
            setPageState(PAGE_STATES.WAITING);
            break;

          case "reveal":
            setPageState(PAGE_STATES.REVEAL);
            break;

          case "unavailable":
          case "complete":
          case "closed":
            setPageState(PAGE_STATES.UNAVAILABLE);
            break;

          default:
            throw new Error(
              `Unexpected Roper claim status: ${
                claimStatus || "missing"
              }`
            );
        }
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error(
          "Could not initialize the Roper activity:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "The activity could not be loaded."
        );

        setPageState(PAGE_STATES.ERROR);
      }
    }

    initializeRoperActivity();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      clearRecordingTimers();
      stopMediaStream();

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [
    audioUrl,
    clearRecordingTimers,
    stopMediaStream,
  ]);

  const stopRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;

    if (
      !mediaRecorder ||
      mediaRecorder.state === "inactive"
    ) {
      return;
    }

    mediaRecorder.stop();
  }, []);

  const startRecording = async () => {
    if (recordingAttemptStartedRef.current) {
      setRecordingError(
        "This turn only allows one recording attempt."
      );
      return;
    }

    const reservationId =
      getReservationId(claimResult);

    if (!reservationId) {
      setRecordingError(
        "The reservation ID is missing. Refresh the page and try again."
      );
      return;
    }

    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setRecordingError(
        "This browser does not support microphone recording."
      );
      return;
    }

    setRecordingError("");
    setRecordingState(
      RECORDING_STATES.REQUESTING_PERMISSION
    );

    let stream = null;

    try {
      /*
       * Ask for browser permission before consuming the single
       * database-authorized attempt. Humanity has suffered enough
       * from permission prompts counting as completed actions.
       */
      stream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

      mediaStreamRef.current = stream;

      const { mimeType, fileExtension } =
        getSupportedRecordingOptions();

      const authorizationResult =
        await startRoperRecording(
          reservationId,
          fileExtension
        );

      const authorizedAudioPath =
        getAuthorizedAudioPath(authorizationResult);

      if (!authorizedAudioPath) {
        throw new Error(
          "The database authorized the recording but did not return an audio upload path."
        );
      }

      authorizedAudioPathRef.current =
        authorizedAudioPath;

      recordingAttemptStartedRef.current = true;
      audioChunksRef.current = [];
      setElapsedSeconds(0);
      setAudioDurationSeconds(0);

      const recorderOptions = mimeType
        ? { mimeType }
        : undefined;

      const mediaRecorder = new MediaRecorder(
        stream,
        recorderOptions
      );

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.addEventListener(
        "dataavailable",
        (event) => {
          if (event.data?.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        }
      );

      mediaRecorder.addEventListener(
        "stop",
        () => {
          clearRecordingTimers();

          const stoppedAt = performance.now();

          const measuredDuration =
            recordingStartedAtRef.current === null
              ? 0
              : Math.min(
                  MAX_RECORDING_SECONDS,
                  Math.max(
                    0,
                    (stoppedAt -
                      recordingStartedAtRef.current) /
                      1000
                  )
                );

          recordingStartedAtRef.current = null;

          const recordedMimeType =
            mediaRecorder.mimeType ||
            mimeType ||
            "audio/webm";

          const completedBlob = new Blob(
            audioChunksRef.current,
            {
              type: recordedMimeType,
            }
          );

          audioChunksRef.current = [];
          stopMediaStream();

          if (completedBlob.size === 0) {
            setRecordingError(
              "The browser created an empty recording."
            );

            setRecordingState(
              RECORDING_STATES.RECORDED
            );

            return;
          }

          const completedAudioUrl =
            URL.createObjectURL(completedBlob);

          setAudioBlob(completedBlob);
          setAudioUrl(completedAudioUrl);
          setAudioDurationSeconds(
            measuredDuration
          );

          setElapsedSeconds(measuredDuration);

          setRecordingState(
            RECORDING_STATES.RECORDED
          );
        }
      );

      mediaRecorder.addEventListener(
        "error",
        (event) => {
          console.error(
            "MediaRecorder error:",
            event
          );

          clearRecordingTimers();
          stopMediaStream();

          setRecordingError(
            "The browser could not finish the recording."
          );

          setRecordingState(
            RECORDING_STATES.RECORDED
          );
        }
      );

      recordingStartedAtRef.current =
        performance.now();

      mediaRecorder.start(250);

      setRecordingState(
        RECORDING_STATES.RECORDING
      );

      timerIntervalRef.current =
        window.setInterval(() => {
          if (
            recordingStartedAtRef.current === null
          ) {
            return;
          }

          const currentElapsed = Math.min(
            MAX_RECORDING_SECONDS,
            (performance.now() -
              recordingStartedAtRef.current) /
              1000
          );

          setElapsedSeconds(currentElapsed);
        }, 100);

      automaticStopTimeoutRef.current =
        window.setTimeout(() => {
          stopRecording();
        }, MAX_RECORDING_SECONDS * 1000);
    } catch (error) {
      console.error(
        "Could not begin recording:",
        error
      );

      clearRecordingTimers();
      stopMediaStream();

      if (
        error?.name === "NotAllowedError" ||
        error?.name === "PermissionDeniedError"
      ) {
        setRecordingError(
          "Microphone permission was denied. Allow microphone access in Chrome, then try again."
        );
      } else if (
        error?.name === "NotFoundError" ||
        error?.name === "DevicesNotFoundError"
      ) {
        setRecordingError(
          "No microphone was found on this device."
        );
      } else {
        setRecordingError(
          error instanceof Error
            ? error.message
            : "The recording could not begin."
        );
      }

      /*
       * Permission failure happens before the backend recording
       * attempt is authorized, so the participant may try again.
       */
      if (!recordingAttemptStartedRef.current) {
        setRecordingState(
          RECORDING_STATES.READY
        );
      } else {
        setRecordingState(
          RECORDING_STATES.RECORDED
        );
      }
    }
  };

  const submitRecording = async () => {
    const reservationId =
      getReservationId(claimResult);

    const authorizedAudioPath =
      authorizedAudioPathRef.current;

    if (!reservationId) {
      setRecordingError(
        "The reservation ID is missing."
      );
      return;
    }

    if (!authorizedAudioPath) {
      setRecordingError(
        "The authorized upload path is missing."
      );
      return;
    }

    if (!audioBlob) {
      setRecordingError(
        "Record your message before submitting."
      );
      return;
    }

    if (audioDurationSeconds <= 0) {
      setRecordingError(
        "The recording duration is invalid."
      );
      return;
    }

    try {
      setRecordingError("");
      setRecordingState(
        RECORDING_STATES.SUBMITTING
      );

      await uploadRoperRecording(
        authorizedAudioPath,
        audioBlob
      );

      const result =
        await completeRoperRecording(
          reservationId,
          audioDurationSeconds
        );

      setCompletionResult(result);
      setPageState(PAGE_STATES.COMPLETED);
    } catch (error) {
      console.error(
        "Could not submit recording:",
        error
      );

      setRecordingError(
        error instanceof Error
          ? error.message
          : "The recording could not be submitted."
      );

      setRecordingState(
        RECORDING_STATES.RECORDED
      );
    }
  };

  const isTurnOne =
    Number(claimResult?.turn_number) === 1;

  const requiresRecording =
    claimResult?.requires_recording !== false;

  return (
    <ActivityLayout
      eyebrow="The Great Hastings Misunderstanding"
      title="What Did Mr. Roper Hear?"
      description="Listen carefully, type what you heard, and record the next version of the phrase."
      icon={Ear}
    >
      {pageState === PAGE_STATES.LOADING && (
        <div
          className="activity-placeholder"
          role="status"
          aria-live="polite"
        >
          <LoaderCircle
            aria-hidden="true"
            size={34}
            strokeWidth={1.8}
          />

          <p className="activity-placeholder__label">
            Checking the hallway
          </p>

          <h2>
            Finding the next misunderstanding...
          </h2>

          <p>
            Mr. Roper is reviewing the situation
            with his usual commitment to accuracy.
          </p>
        </div>
      )}

      {pageState === PAGE_STATES.ACTIVE_TURN &&
        isTurnOne &&
        requiresRecording && (
          <div className="activity-placeholder">
            <p className="activity-placeholder__label">
              Turn 1
            </p>

            <h2>
              Start the misunderstanding
            </h2>

            {claimResult?.character_name && (
              <p>
                You are speaking as{" "}
                <strong>
                  {claimResult.character_name}
                </strong>
                .
              </p>
            )}

            <div className="activity-placeholder__details">
              <p>
                Read this phrase aloud exactly as
                written:
              </p>

              <p>
                <strong>
                  {claimResult?.original_phrase ||
                    "The original phrase is unavailable."}
                </strong>
              </p>
            </div>

            <p>
              You have one recording attempt and a
              maximum of {MAX_RECORDING_SECONDS}{" "}
              seconds. You may listen to the
              finished recording before submitting
              it, but you cannot record it again.
            </p>

            {recordingState ===
              RECORDING_STATES.READY && (
              <button
                className="primary-button"
                type="button"
                onClick={startRecording}
              >
                <Mic
                  aria-hidden="true"
                  size={20}
                />
                Allow Microphone and Record
              </button>
            )}

            {recordingState ===
              RECORDING_STATES.REQUESTING_PERMISSION && (
              <div
                role="status"
                aria-live="polite"
              >
                <LoaderCircle
                  aria-hidden="true"
                  size={30}
                />

                <p>
                  Waiting for microphone
                  permission...
                </p>
              </div>
            )}

            {recordingState ===
              RECORDING_STATES.RECORDING && (
              <div
                role="status"
                aria-live="polite"
              >
                <p className="activity-placeholder__label">
                  Recording
                </p>

                <p>
                  {formatSeconds(elapsedSeconds)} /{" "}
                  {MAX_RECORDING_SECONDS.toFixed(
                    1
                  )}{" "}
                  seconds
                </p>

                <progress
                  max={MAX_RECORDING_SECONDS}
                  value={elapsedSeconds}
                  aria-label="Recording time used"
                />

                <button
                  className="primary-button"
                  type="button"
                  onClick={stopRecording}
                >
                  <Square
                    aria-hidden="true"
                    size={18}
                  />
                  Stop Recording
                </button>
              </div>
            )}

            {recordingState ===
              RECORDING_STATES.RECORDED && (
              <div>
                <p className="activity-placeholder__label">
                  Recording complete
                </p>

                <p>
                  Length:{" "}
                  {formatSeconds(
                    audioDurationSeconds
                  )}{" "}
                  seconds
                </p>

                {audioUrl && (
                  <div>
                    <p>
                      <Play
                        aria-hidden="true"
                        size={18}
                      />{" "}
                      Review your recording:
                    </p>

                    <audio
                      controls
                      preload="metadata"
                      src={audioUrl}
                    >
                      Your browser cannot play this
                      recording.
                    </audio>
                  </div>
                )}

                <button
                  className="primary-button"
                  type="button"
                  onClick={submitRecording}
                  disabled={!audioBlob}
                >
                  <Upload
                    aria-hidden="true"
                    size={19}
                  />
                  Submit Recording Permanently
                </button>

                <p>
                  Submission cannot be undone or
                  replaced.
                </p>
              </div>
            )}

            {recordingState ===
              RECORDING_STATES.SUBMITTING && (
              <div
                role="status"
                aria-live="polite"
              >
                <LoaderCircle
                  aria-hidden="true"
                  size={30}
                />

                <p>
                  Uploading and locking the
                  recording...
                </p>
              </div>
            )}

            {recordingError && (
              <div role="alert">
                <p>
                  <strong>
                    Recording problem:
                  </strong>
                </p>

                <p>{recordingError}</p>
              </div>
            )}
          </div>
        )}

      {pageState === PAGE_STATES.ACTIVE_TURN &&
        (!isTurnOne || !requiresRecording) && (
          <div className="activity-placeholder">
            <p className="activity-placeholder__label">
              Turn ready
            </p>

            <h2>
              Your misunderstanding is ready.
            </h2>

            <p>
              You have Turn{" "}
              {claimResult?.turn_number ?? "—"} in
              Conversation{" "}
              {claimResult?.conversation_number ??
                "—"}
              .
            </p>

            <p>
              Turns 2 through 5 will be implemented
              in the next gameplay milestone.
            </p>
          </div>
        )}

      {pageState === PAGE_STATES.COMPLETED && (
        <div
          className="activity-placeholder"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2
            aria-hidden="true"
            size={38}
          />

          <p className="activity-placeholder__label">
            Turn complete
          </p>

          <h2>
            Your message has entered the hallway.
          </h2>

          <p>
            The recording was uploaded and the turn
            was permanently completed.
          </p>

          {completionResult?.next_turn_number && (
            <p>
              Turn{" "}
              {completionResult.next_turn_number} is
              now available to the next participant.
            </p>
          )}

          <button
            className="primary-button"
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Return to Apartment 201
          </button>
        </div>
      )}

      {pageState === PAGE_STATES.WAITING && (
        <div
          className="activity-placeholder"
          role="status"
          aria-live="polite"
        >
          <p className="activity-placeholder__label">
            Please wait
          </p>

          <h2>
            Someone is currently misunderstanding
            the situation.
          </h2>

          <p>Please wait a moment.</p>

          {Number.isFinite(
            Number(
              claimResult?.seconds_remaining
            )
          ) && (
            <p>
              Their reservation has about{" "}
              {Math.max(
                0,
                Math.ceil(
                  Number(
                    claimResult.seconds_remaining
                  )
                )
              )}{" "}
              seconds remaining.
            </p>
          )}
        </div>
      )}

      {pageState === PAGE_STATES.REVEAL && (
        <div className="activity-placeholder">
          <p className="activity-placeholder__label">
            Conversations revealed
          </p>

          <h2>
            Mr. Roper has heard enough.
          </h2>

          <p>
            The completed misunderstanding chains
            are now available.
          </p>

          {activityState?.reveal_at && (
            <p>
              Reveal time:{" "}
              {new Date(
                activityState.reveal_at
              ).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {pageState ===
        PAGE_STATES.UNAVAILABLE && (
        <div className="activity-placeholder">
          <p className="activity-placeholder__label">
            Activity unavailable
          </p>

          <h2>
            No misunderstanding is available right
            now.
          </h2>

          <p>
            The activity may be complete, paused,
            or waiting for another conversation
            cycle to begin.
          </p>
        </div>
      )}

      {pageState === PAGE_STATES.ERROR && (
        <div
          className="activity-placeholder"
          role="alert"
        >
          <p className="activity-placeholder__label">
            Something went wrong
          </p>

          <h2>
            Mr. Roper lost the message entirely.
          </h2>

          <p>{errorMessage}</p>

          <button
            className="primary-button"
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>
        </div>
      )}
    </ActivityLayout>
  );
}

export default MrRoperHeardPage;