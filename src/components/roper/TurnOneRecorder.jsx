import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  LoaderCircle,
  Mic,
  Play,
  Square,
  Upload,
} from "lucide-react";

import {
  completeRoperRecording,
  startRoperRecording,
  uploadRoperRecording,
} from "../../lib/roperService";

import {
  formatSeconds,
  getAuthorizedAudioPath,
  getReservationId,
  getSupportedRecordingOptions,
  MAX_RECORDING_SECONDS,
} from "./roperUtils";

const RECORDING_STATES = {
  READY: "ready",
  REQUESTING_PERMISSION: "requesting-permission",
  RECORDING: "recording",
  RECORDED: "recorded",
  SUBMITTING: "submitting",
};

function TurnOneRecorder({
  claimResult,
  onCompleted,
}) {
  const [recordingState, setRecordingState] =
    useState(RECORDING_STATES.READY);

  const [recordingError, setRecordingError] =
    useState("");

  const [elapsedSeconds, setElapsedSeconds] =
    useState(0);

  const [audioBlob, setAudioBlob] =
    useState(null);

  const [audioUrl, setAudioUrl] =
    useState("");

  const [
    audioDurationSeconds,
    setAudioDurationSeconds,
  ] = useState(0);

  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingStartedAtRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const automaticStopTimeoutRef = useRef(null);

  const recordingAttemptStartedRef =
    useRef(false);

  const authorizedAudioPathRef =
    useRef(null);

  const clearRecordingTimers = useCallback(() => {
    if (timerIntervalRef.current) {
      window.clearInterval(
        timerIntervalRef.current
      );

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

  const stopRecording = useCallback(() => {
    const mediaRecorder =
      mediaRecorderRef.current;

    if (
      !mediaRecorder ||
      mediaRecorder.state === "inactive"
    ) {
      return;
    }

    mediaRecorder.stop();
  }, []);

  useEffect(() => {
    return () => {
      clearRecordingTimers();
      stopMediaStream();
    };
  }, [
    clearRecordingTimers,
    stopMediaStream,
  ]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  async function startRecording() {
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
      stream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

      mediaStreamRef.current = stream;

      const {
        mimeType,
        fileExtension,
      } = getSupportedRecordingOptions();

      const authorizationResult =
        await startRoperRecording(
          reservationId,
          fileExtension
        );

      const authorizedAudioPath =
        getAuthorizedAudioPath(
          authorizationResult
        );

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

      const mediaRecorder =
        new MediaRecorder(
          stream,
          recorderOptions
        );

      mediaRecorderRef.current =
        mediaRecorder;

      mediaRecorder.addEventListener(
        "dataavailable",
        (event) => {
          if (event.data?.size > 0) {
            audioChunksRef.current.push(
              event.data
            );
          }
        }
      );

      mediaRecorder.addEventListener(
        "stop",
        () => {
          clearRecordingTimers();

          const stoppedAt =
            performance.now();

          const measuredDuration =
            recordingStartedAtRef.current ===
            null
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

          recordingStartedAtRef.current =
            null;

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
            URL.createObjectURL(
              completedBlob
            );

          setAudioBlob(completedBlob);
          setAudioUrl(completedAudioUrl);

          setAudioDurationSeconds(
            measuredDuration
          );

          setElapsedSeconds(
            measuredDuration
          );

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
            recordingStartedAtRef.current ===
            null
          ) {
            return;
          }

          const currentElapsed = Math.min(
            MAX_RECORDING_SECONDS,
            (performance.now() -
              recordingStartedAtRef.current) /
              1000
          );

          setElapsedSeconds(
            currentElapsed
          );
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
        error?.name ===
          "PermissionDeniedError"
      ) {
        setRecordingError(
          "Microphone permission was denied. Allow microphone access in Chrome, then try again."
        );
      } else if (
        error?.name === "NotFoundError" ||
        error?.name ===
          "DevicesNotFoundError"
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

      if (
        !recordingAttemptStartedRef.current
      ) {
        setRecordingState(
          RECORDING_STATES.READY
        );
      } else {
        setRecordingState(
          RECORDING_STATES.RECORDED
        );
      }
    }
  }

  async function submitRecording() {
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

      const completionResult =
        await completeRoperRecording(
          reservationId,
          audioDurationSeconds
        );

      onCompleted(completionResult);
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
  }

  return (
    <div className="activity-placeholder">
      <p className="activity-placeholder__label">
        Turn 1
      </p>

      <h2>Start the misunderstanding</h2>

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
  );
}

export default TurnOneRecorder;