import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CheckCircle2,
  Ear,
  LoaderCircle,
  LockKeyhole,
  Play,
  Send,
} from "lucide-react";

import {
  completeRoperPlayback,
  createRoperSignedAudioUrl,
  startRoperPlayback,
  submitRoperTypedPhrase,
} from "../../lib/roperService";

import {
  getCharacterName,
  getConversationNumber,
  getPlaybackAudioPath,
  getPreviousAudioPath,
  getReservationId,
  getTurnNumber,
  MAX_TYPED_PHRASE_LENGTH,
} from "./roperUtils";

const GAMEPLAY_STATES = {
  READY_TO_PLAY: "ready-to-play",
  AUTHORIZING_PLAYBACK:
    "authorizing-playback",
  READY_TO_LISTEN: "ready-to-listen",
  PLAYING: "playing",
  READY_TO_TYPE: "ready-to-type",
  SUBMITTING_PHRASE:
    "submitting-phrase",
  PHRASE_LOCKED: "phrase-locked",
};

function FutureTurnGameplay({
  claimResult,
  onPhraseSubmitted,
}) {
  const [gameplayState, setGameplayState] =
    useState(
      GAMEPLAY_STATES.READY_TO_PLAY
    );

  const [audioUrl, setAudioUrl] =
    useState("");

  const [typedPhrase, setTypedPhrase] =
    useState("");

  const [lockedPhrase, setLockedPhrase] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const audioRef = useRef(null);
  const playbackCompletedRef =
    useRef(false);

  const playbackStartedRef =
    useRef(false);


  const reservationId =
    getReservationId(claimResult);

  const turnNumber =
    getTurnNumber(claimResult);

  const conversationNumber =
    getConversationNumber(claimResult);

  const characterName =
    getCharacterName(claimResult);

  useEffect(() => {
  return () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };
}, []);

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

      if (!playbackStartedRef.current) {
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
    const audio = event.currentTarget;

    if (
      audio.seeking &&
      Math.abs(
        audio.currentTime -
          audio.dataset.lastTime
      ) > 0.5
    ) {
      audio.currentTime =
        Number(
          audio.dataset.lastTime
        ) || 0;
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

      setGameplayState(
        GAMEPLAY_STATES.PHRASE_LOCKED
      );

      onPhraseSubmitted?.({
        typedPhrase:
          normalizedPhrase,
        submissionResult,
      });
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
            The recording is ready. Playback
            begins when you press the button
            below.
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
          onContextMenu={(event) =>
            event.preventDefault()
          }
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

          <h3>
            Pay attention. Human memory is
            about to become the game mechanic.
          </h3>

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
            Permanently locking your version...
          </p>
        </div>
      )}

      {gameplayState ===
        GAMEPLAY_STATES.PHRASE_LOCKED && (
        <div
          role="status"
          aria-live="polite"
        >
          <CheckCircle2
            aria-hidden="true"
            size={38}
          />

          <p className="activity-placeholder__label">
            Phrase locked
          </p>

          <h3>
            You heard:
          </h3>

          <blockquote>
            “{lockedPhrase}”
          </blockquote>

          <p>
            {turnNumber === 5
              ? "Turn 5 will complete here in the next submilestone."
              : "The recording step for this new version comes next."}
          </p>

          <LockKeyhole
            aria-hidden="true"
            size={24}
          />
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