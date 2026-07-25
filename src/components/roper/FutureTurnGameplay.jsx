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
  LockKeyhole,
  Mic,
  Play,
  Send,
  Square,
  Upload,
} from "lucide-react";

import {
  completeRoperFinalTurn,
  completeRoperPlayback,
  completeRoperRecording,
  createRoperSignedAudioUrl,
  startRoperPlayback,
  startRoperRecording,
  submitRoperTypedPhrase,
  uploadRoperRecording,
} from "../../lib/roperService";

import {
  formatSeconds,
  getAuthorizedAudioPath,
  getCharacterName,
  getConversationNumber,
  getPlaybackAudioPath,
  getPreviousAudioPath,
  getReservationId,
  getSupportedRecordingOptions,
  getTurnNumber,
  MAX_RECORDING_SECONDS,
  MAX_TYPED_PHRASE_LENGTH,
} from "./roperUtils";

const GAMEPLAY_STATES = {
  READY_TO_PLAY: "ready-to-play",
  AUTHORIZING_PLAYBACK: "authorizing-playback",
  READY_TO_LISTEN: "ready-to-listen",
  PLAYING: "playing",
  READY_TO_TYPE: "ready-to-type",
  SUBMITTING_PHRASE: "submitting-phrase",
  PHRASE_LOCKED: "phrase-locked",
  REQUESTING_MICROPHONE: "requesting-microphone",
  RECORDING: "recording",
  RECORDING_REVIEW: "recording-review",
  SUBMITTING_RECORDING: "submitting-recording",
  COMPLETING_FINAL_TURN: "completing-final-turn",
};

function FutureTurnGameplay({
  claimResult,
  onCompleted,
}) {
  const [gameplayState, setGameplayState] =
    useState(GAMEPLAY_STATES.READY_TO_PLAY);

  const [audioUrl, setAudioUrl] =
    useState("");

  const [typedPhrase, setTypedPhrase] =
    useState("");

  const [lockedPhrase, setLockedPhrase] =
    useState("");

  const [recordingBlob, setRecordingBlob] =
    useState(null);

  const [recordingUrl, setRecordingUrl] =
    useState("");

  const [
    recordingDurationSeconds,
    setRecordingDurationSeconds,
  ] = useState(0);

  const [elapsedSeconds, setElapsedSeconds] =
    useState(0);

  const [errorMessage, setErrorMessage] =
    useState("");

  const audioRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);

  const recordingStartedAtRef =
    useRef(null);

  const timerIntervalRef = useRef(null);

  const automaticStopTimeoutRef =
    useRef(null);

  const playbackCompletedRef =
    useRef(false);

  const playbackStartedRef =
    useRef(false);

  const recordingAttemptStartedRef =
    useRef(false);

  const authorizedAudioPathRef =
    useRef(null);

  const reservationId =
    getReservationId(claimResult);

  const turnNumber =
    getTurnNumber(claimResult);

  const conversationNumber =
    getConversationNumber(claimResult);

  const characterName =
    getCharacterName(claimResult);

  const isFinalTurn =
    turnNumber === 5;

  const clearRecordingTimers =
    useCallback(() => {
      if (timerIntervalRef.current) {
        window.clearInterval(
          timerIntervalRef.current
        );

        timerIntervalRef.current = null;
      }

      if (
        automaticStopTimeoutRef.current
      ) {
        window.clearTimeout(
          automaticStopTimeoutRef.current
        );

        automaticStopTimeoutRef.current =
          null;
      }
    }, []);

  const stopMediaStream =
    useCallback(() => {
      if (!mediaStreamRef.current) {
        return;
      }

      mediaStreamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      mediaStreamRef.current = null;
    }, []);

  const stopRecording =
    useCallback(() => {
      const recorder =
        mediaRecorderRef.current;

      if (
        !recorder ||
        recorder.state === "inactive"
      ) {
        return;
      }

      recorder.stop();
    }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      clearRecordingTimers();
      stopMediaStream();
    };
  }, [
    clearRecordingTimers,
    stopMediaStream,
  ]);

  useEffect(() => {
    return () => {
      if (recordingUrl) {
        URL.revokeObjectURL(
          recordingUrl
        );
      }
    };
  }, [recordingUrl]);

  async function authorizePlayback() {
    if (playbackStartedRef.current) {
      setErrorMessage(
        "Playback has already been authorized for this turn."
      );

      return;
    }

    if (!reservationId) {
      setErrorMessage(
        "The reservation ID is missing. Refresh the page and try again."
      );

      return;
    }

    try {
      setErrorMessage("");

      setGameplayState(
        GAMEPLAY_STATES.AUTHORIZING_PLAYBACK
      );

      const playbackResult =
        await startRoperPlayback(
          reservationId
        );

      const audioPath =
        getPlaybackAudioPath(
          playbackResult
        ) ||
        getPreviousAudioPath(
          claimResult
        );

      if (!audioPath) {
        console.error(
          "Playback authorization result:",
          playbackResult
        );

        console.error(
          "Current turn result:",
          claimResult
        );

        throw new Error(
          "Playback was authorized, but no previous audio path was returned."
        );
      }

      const signedUrl =
        await createRoperSignedAudioUrl(
          audioPath,
          90
        );

      playbackStartedRef.current = true;

      setAudioUrl(signedUrl);

      setGameplayState(
        GAMEPLAY_STATES.READY_TO_LISTEN
      );
    } catch (error) {
      console.error(
        "Could not authorize Roper playback:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The previous recording could not be loaded."
      );

      if (
        !playbackStartedRef.current
      ) {
        setGameplayState(
          GAMEPLAY_STATES.READY_TO_PLAY
        );
      }
    }
  }

  async function beginPlayback() {
    if (!audioRef.current) {
      setErrorMessage(
        "The audio player is not ready."
      );

      return;
    }

    try {
      setErrorMessage("");

      setGameplayState(
        GAMEPLAY_STATES.PLAYING
      );

      await audioRef.current.play();
    } catch (error) {
      console.error(
        "Could not begin audio playback:",
        error
      );

      setErrorMessage(
        "Chrome blocked playback. Press the play button again."
      );

      setGameplayState(
        GAMEPLAY_STATES.READY_TO_LISTEN
      );
    }
  }

  async function handlePlaybackEnded() {
    if (
      playbackCompletedRef.current
    ) {
      return;
    }

    playbackCompletedRef.current = true;

    try {
      setErrorMessage("");

      await completeRoperPlayback(
        reservationId
      );

      setGameplayState(
        GAMEPLAY_STATES.READY_TO_TYPE
      );
    } catch (error) {
      console.error(
        "Could not complete Roper playback:",
        error
      );

      playbackCompletedRef.current = false;

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Playback finished, but the turn could not be unlocked."
      );

      setGameplayState(
        GAMEPLAY_STATES.READY_TO_LISTEN
      );
    }
  }

  function preventAudioSeeking(event) {
    const audio =
      event.currentTarget;

    const lastTime = Number(
      audio.dataset.lastTime
    );

    if (
      audio.seeking &&
      Number.isFinite(lastTime) &&
      Math.abs(
        audio.currentTime - lastTime
      ) > 0.5
    ) {
      audio.currentTime = lastTime;
    }
  }

  function rememberAudioTime(event) {
    event.currentTarget.dataset.lastTime =
      String(
        event.currentTarget.currentTime
      );
  }

  async function submitPhrase(event) {
    event.preventDefault();

    const normalizedPhrase =
      typedPhrase.trim();

    if (!normalizedPhrase) {
      setErrorMessage(
        "Type what you heard before submitting."
      );

      return;
    }

    if (
      normalizedPhrase.length >
      MAX_TYPED_PHRASE_LENGTH
    ) {
      setErrorMessage(
        `The phrase cannot exceed ${MAX_TYPED_PHRASE_LENGTH} characters.`
      );

      return;
    }

    try {
      setErrorMessage("");

      setGameplayState(
        GAMEPLAY_STATES.SUBMITTING_PHRASE
      );

      const submissionResult =
        await submitRoperTypedPhrase(
          reservationId,
          normalizedPhrase
        );

      setLockedPhrase(
        normalizedPhrase
      );

      if (isFinalTurn) {
        setGameplayState(
          GAMEPLAY_STATES.COMPLETING_FINAL_TURN
        );

        const finalResult =
          await completeRoperFinalTurn(
            reservationId
          );

        onCompleted?.(
          finalResult ||
            submissionResult
        );

        return;
      }

      setGameplayState(
        GAMEPLAY_STATES.PHRASE_LOCKED
      );
    } catch (error) {
      console.error(
        "Could not submit typed phrase:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The typed phrase could not be submitted."
      );

      setGameplayState(
        GAMEPLAY_STATES.READY_TO_TYPE
      );
    }
  }

  async function startRecording() {
    if (
      recordingAttemptStartedRef.current
    ) {
      setErrorMessage(
        "This turn only allows one recording attempt."
      );

      return;
    }

    if (!reservationId) {
      setErrorMessage(
        "The reservation ID is missing."
      );

      return;
    }

    if (
      !navigator.mediaDevices
        ?.getUserMedia ||
      typeof MediaRecorder ===
        "undefined"
    ) {
      setErrorMessage(
        "This browser does not support microphone recording."
      );

      return;
    }

    let stream = null;

    try {
      setErrorMessage("");

      setGameplayState(
        GAMEPLAY_STATES.REQUESTING_MICROPHONE
      );

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
        console.error(
          "Recording authorization result:",
          authorizationResult
        );

        throw new Error(
          "Recording was authorized, but no upload path was returned."
        );
      }

      authorizedAudioPathRef.current =
        authorizedAudioPath;

      recordingAttemptStartedRef.current =
        true;

      audioChunksRef.current = [];

      setElapsedSeconds(0);
      setRecordingDurationSeconds(0);

      const recorderOptions =
        mimeType
          ? { mimeType }
          : undefined;

      const recorder =
        new MediaRecorder(
          stream,
          recorderOptions
        );

      mediaRecorderRef.current =
        recorder;

      recorder.addEventListener(
        "dataavailable",
        (event) => {
          if (event.data?.size > 0) {
            audioChunksRef.current.push(
              event.data
            );
          }
        }
      );

      recorder.addEventListener(
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
            recorder.mimeType ||
            mimeType ||
            "audio/webm";

          const completedBlob =
            new Blob(
              audioChunksRef.current,
              {
                type: recordedMimeType,
              }
            );

          audioChunksRef.current = [];

          stopMediaStream();

          if (
            completedBlob.size === 0
          ) {
            setErrorMessage(
              "The browser created an empty recording."
            );

            setGameplayState(
              GAMEPLAY_STATES.RECORDING_REVIEW
            );

            return;
          }

          const completedUrl =
            URL.createObjectURL(
              completedBlob
            );

          setRecordingBlob(
            completedBlob
          );

          setRecordingUrl(
            completedUrl
          );

          setRecordingDurationSeconds(
            measuredDuration
          );

          setElapsedSeconds(
            measuredDuration
          );

          setGameplayState(
            GAMEPLAY_STATES.RECORDING_REVIEW
          );
        }
      );

      recorder.addEventListener(
        "error",
        (event) => {
          console.error(
            "MediaRecorder error:",
            event
          );

          clearRecordingTimers();
          stopMediaStream();

          setErrorMessage(
            "The browser could not finish the recording."
          );

          setGameplayState(
            GAMEPLAY_STATES.RECORDING_REVIEW
          );
        }
      );

      recordingStartedAtRef.current =
        performance.now();

      recorder.start(250);

      setGameplayState(
        GAMEPLAY_STATES.RECORDING
      );

      timerIntervalRef.current =
        window.setInterval(() => {
          if (
            recordingStartedAtRef.current ===
            null
          ) {
            return;
          }

          const currentElapsed =
            Math.min(
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
        error?.name ===
          "NotAllowedError" ||
        error?.name ===
          "PermissionDeniedError"
      ) {
        setErrorMessage(
          "Microphone permission was denied. Allow microphone access in Chrome, then try again."
        );
      } else if (
        error?.name ===
          "NotFoundError" ||
        error?.name ===
          "DevicesNotFoundError"
      ) {
        setErrorMessage(
          "No microphone was found on this device."
        );
      } else {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "The recording could not begin."
        );
      }

      if (
        recordingAttemptStartedRef.current
      ) {
        setGameplayState(
          GAMEPLAY_STATES.RECORDING_REVIEW
        );
      } else {
        setGameplayState(
          GAMEPLAY_STATES.PHRASE_LOCKED
        );
      }
    }
  }

  async function submitRecording() {
    const authorizedAudioPath =
      authorizedAudioPathRef.current;

    if (!reservationId) {
      setErrorMessage(
        "The reservation ID is missing."
      );

      return;
    }

    if (!authorizedAudioPath) {
      setErrorMessage(
        "The authorized upload path is missing."
      );

      return;
    }

    if (!recordingBlob) {
      setErrorMessage(
        "Record the phrase before submitting."
      );

      return;
    }

    if (
      recordingDurationSeconds <= 0
    ) {
      setErrorMessage(
        "The recording duration is invalid."
      );

      return;
    }

    try {
      setErrorMessage("");

      setGameplayState(
        GAMEPLAY_STATES.SUBMITTING_RECORDING
      );

      await uploadRoperRecording(
        authorizedAudioPath,
        recordingBlob
      );

      const completionResult =
        await completeRoperRecording(
          reservationId,
          recordingDurationSeconds
        );

      onCompleted?.(
        completionResult
      );
    } catch (error) {
      console.error(
        "Could not submit recording:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The recording could not be submitted."
      );

      setGameplayState(
        GAMEPLAY_STATES.RECORDING_REVIEW
      );
    }
  }

  return (
    <div className="activity-placeholder">
      <p className="activity-placeholder__label">
        Turn {turnNumber ?? "—"}
      </p>

      <h2>What did you hear?</h2>

      <p>
        Conversation{" "}
        {conversationNumber ?? "—"}
      </p>

      {characterName && (
        <p>
          You are playing{" "}
          <strong>
            {characterName}
          </strong>
          .
        </p>
      )}

      {gameplayState ===
        GAMEPLAY_STATES.READY_TO_PLAY && (
        <>
          <Ear
            aria-hidden="true"
            size={36}
          />

          <p>
            You may hear the previous
            recording only once. Listen
            carefully. After it finishes,
            type exactly what you think was
            said.
          </p>

          <button
            className="primary-button"
            type="button"
            onClick={authorizePlayback}
          >
            <Play
              aria-hidden="true"
              size={19}
            />
            Prepare One-Time Playback
          </button>
        </>
      )}

      {gameplayState ===
        GAMEPLAY_STATES.AUTHORIZING_PLAYBACK && (
        <div
          role="status"
          aria-live="polite"
        >
          <LoaderCircle
            aria-hidden="true"
            size={30}
          />

          <p>
            Retrieving the previous
            misunderstanding...
          </p>
        </div>
      )}

      {gameplayState ===
        GAMEPLAY_STATES.READY_TO_LISTEN && (
        <>
          <p>
            The recording is ready.
            Playback begins when you press
            the button below.
          </p>

          <button
            className="primary-button"
            type="button"
            onClick={beginPlayback}
          >
            <Play
              aria-hidden="true"
              size={19}
            />
            Play Recording Once
          </button>
        </>
      )}

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          controls={false}
          onPlay={() => {
            setGameplayState(
              GAMEPLAY_STATES.PLAYING
            );
          }}
          onEnded={
            handlePlaybackEnded
          }
          onTimeUpdate={
            rememberAudioTime
          }
          onSeeking={
            preventAudioSeeking
          }
          onContextMenu={(event) => {
            event.preventDefault();
          }}
        />
      )}

      {gameplayState ===
        GAMEPLAY_STATES.PLAYING && (
        <div
          role="status"
          aria-live="polite"
        >
          <Ear
            aria-hidden="true"
            size={36}
          />

          <p className="activity-placeholder__label">
            Listening
          </p>

          <h3>Listen carefully.</h3>

          <p>
            The text box unlocks when the
            recording finishes.
          </p>
        </div>
      )}

      {gameplayState ===
        GAMEPLAY_STATES.READY_TO_TYPE && (
        <form onSubmit={submitPhrase}>
          <p className="activity-placeholder__label">
            Playback complete
          </p>

          <h3>
            Type exactly what you heard
          </h3>

          <label htmlFor="roper-typed-phrase">
            Your version of the phrase
          </label>

          <textarea
            id="roper-typed-phrase"
            value={typedPhrase}
            onChange={(event) => {
              setTypedPhrase(
                event.target.value.slice(
                  0,
                  MAX_TYPED_PHRASE_LENGTH
                )
              );
            }}
            maxLength={
              MAX_TYPED_PHRASE_LENGTH
            }
            rows={4}
            autoFocus
            required
          />

          <p>
            {typedPhrase.length} /{" "}
            {MAX_TYPED_PHRASE_LENGTH}
          </p>

          <p>
            Once submitted, this phrase is
            permanently locked.
          </p>

          <button
            className="primary-button"
            type="submit"
            disabled={
              !typedPhrase.trim()
            }
          >
            <Send
              aria-hidden="true"
              size={19}
            />
            Submit What I Heard
          </button>
        </form>
      )}

      {gameplayState ===
        GAMEPLAY_STATES.SUBMITTING_PHRASE && (
        <div
          role="status"
          aria-live="polite"
        >
          <LoaderCircle
            aria-hidden="true"
            size={30}
          />

          <p>
            Permanently locking your
            version...
          </p>
        </div>
      )}

      {gameplayState ===
        GAMEPLAY_STATES.PHRASE_LOCKED && (
        <div>
          <CheckCircle2
            aria-hidden="true"
            size={38}
          />

          <p className="activity-placeholder__label">
            Phrase locked
          </p>

          <h3>You heard:</h3>

          <blockquote>
            “{lockedPhrase}”
          </blockquote>

          <p>
            Now record that phrase aloud
            exactly as you typed it.
          </p>

          <p>
            You have one recording attempt
            and a maximum of{" "}
            {MAX_RECORDING_SECONDS} seconds.
          </p>

          <button
            className="primary-button"
            type="button"
            onClick={startRecording}
          >
            <Mic
              aria-hidden="true"
              size={19}
            />
            Allow Microphone and Record
          </button>

          <LockKeyhole
            aria-hidden="true"
            size={24}
          />
        </div>
      )}

      {gameplayState ===
        GAMEPLAY_STATES.REQUESTING_MICROPHONE && (
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

      {gameplayState ===
        GAMEPLAY_STATES.RECORDING && (
        <div
          role="status"
          aria-live="polite"
        >
          <p className="activity-placeholder__label">
            Recording
          </p>

          <blockquote>
            “{lockedPhrase}”
          </blockquote>

          <p>
            {formatSeconds(
              elapsedSeconds
            )}{" "}
            /{" "}
            {MAX_RECORDING_SECONDS.toFixed(
              1
            )}{" "}
            seconds
          </p>

          <progress
            max={
              MAX_RECORDING_SECONDS
            }
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

      {gameplayState ===
        GAMEPLAY_STATES.RECORDING_REVIEW && (
        <div>
          <p className="activity-placeholder__label">
            Recording complete
          </p>

          <p>
            Length:{" "}
            {formatSeconds(
              recordingDurationSeconds
            )}{" "}
            seconds
          </p>

          {recordingUrl && (
            <>
              <p>
                Review your recording:
              </p>

              <audio
                controls
                preload="metadata"
                src={recordingUrl}
              >
                Your browser cannot play
                this recording.
              </audio>
            </>
          )}

          <button
            className="primary-button"
            type="button"
            onClick={submitRecording}
            disabled={!recordingBlob}
          >
            <Upload
              aria-hidden="true"
              size={19}
            />
            Submit Recording Permanently
          </button>

          <p>
            The recording cannot be
            replaced after submission.
          </p>
        </div>
      )}

      {gameplayState ===
        GAMEPLAY_STATES.SUBMITTING_RECORDING && (
        <div
          role="status"
          aria-live="polite"
        >
          <LoaderCircle
            aria-hidden="true"
            size={30}
          />

          <p>
            Uploading and completing the
            turn...
          </p>
        </div>
      )}

      {gameplayState ===
        GAMEPLAY_STATES.COMPLETING_FINAL_TURN && (
        <div
          role="status"
          aria-live="polite"
        >
          <LoaderCircle
            aria-hidden="true"
            size={30}
          />

          <p>
            Locking the final version of the
            misunderstanding...
          </p>
        </div>
      )}

      {errorMessage && (
        <div role="alert">
          <p>
            <strong>
              Gameplay problem:
            </strong>
          </p>

          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
}

export default FutureTurnGameplay;