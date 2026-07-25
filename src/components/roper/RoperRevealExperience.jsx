import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Headphones,
  LoaderCircle,
  Pause,
  Play,
  RotateCcw,
  Volume2,
} from "lucide-react";

import {
  createRoperSignedAudioUrl,
  getRoperReveal,
} from "../../lib/roperService";

const STAGE_REVEAL_DELAY_MS = 450;

function normalizeConversations(result) {
  return Array.isArray(result?.conversations)
    ? result.conversations
    : [];
}

function getOrderedStages(conversation) {
  if (!Array.isArray(conversation?.stages)) {
    return [];
  }

  return [...conversation.stages].sort(
    (firstStage, secondStage) =>
      Number(firstStage?.turn_number ?? 0) -
      Number(secondStage?.turn_number ?? 0)
  );
}

function getStageTitle(stage, stageCount) {
  const turnNumber = Number(
    stage?.turn_number
  );

  if (turnNumber === 1) {
    return "First Recording";
  }

  if (turnNumber === 5) {
    return "Final Guess";
  }

  if (turnNumber === stageCount) {
    return "Final Guess";
  }

  return `Turn ${turnNumber}`;
}

function getStageSubtitle(stage) {
  const turnNumber = Number(
    stage?.turn_number
  );

  switch (turnNumber) {
    case 1:
      return "The original phrase enters the hallway.";

    case 2:
      return "The first misunderstanding.";

    case 3:
      return "Things begin to drift.";

    case 4:
      return "The original is hanging on by a thread.";

    case 5:
      return "What Mr. Roper finally heard.";

    default:
      return "Another step in the misunderstanding.";
  }
}

function formatConversationLabel(
  conversation,
  index
) {
  const number =
    conversation?.conversation_number ??
    index + 1;

  return `Conversation ${number}`;
}

function formatRevealDate(revealAt) {
  if (!revealAt) {
    return "7:00 PM";
  }

  const date = new Date(revealAt);

  if (Number.isNaN(date.getTime())) {
    return "7:00 PM";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function RoperRevealExperience() {
  const [revealResult, setRevealResult] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    selectedConversationIndex,
    setSelectedConversationIndex,
  ] = useState(0);

  const [
    visibleStageCount,
    setVisibleStageCount,
  ] = useState(0);

  const [
    activeAudioPath,
    setActiveAudioPath,
  ] = useState(null);

  const [
    loadingAudioPath,
    setLoadingAudioPath,
  ] = useState(null);

  const [isAudioPlaying, setIsAudioPlaying] =
    useState(false);

  const audioRef = useRef(null);
  const animationTimeoutRef = useRef(null);

  const conversations = useMemo(
    () =>
      normalizeConversations(
        revealResult
      ),
    [revealResult]
  );

  const selectedConversation =
    conversations[
      selectedConversationIndex
    ] ?? null;

  const stages = useMemo(
    () =>
      getOrderedStages(
        selectedConversation
      ),
    [selectedConversation]
  );

  const finalStage =
    stages.length > 0
      ? stages[stages.length - 1]
      : null;

  const loadReveal =
    useCallback(async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const result =
          await getRoperReveal();

        setRevealResult(result);

        if (
          result?.status === "revealed"
        ) {
          setSelectedConversationIndex(0);
        }
      } catch (error) {
        console.error(
          "Could not load the Roper reveal:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "The misunderstanding could not be loaded."
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    loadReveal();
  }, [loadReveal]);

  useEffect(() => {
    setVisibleStageCount(0);

    if (animationTimeoutRef.current) {
      window.clearTimeout(
        animationTimeoutRef.current
      );
    }

    function revealNextStage(
      nextCount
    ) {
      if (nextCount > stages.length) {
        return;
      }

      animationTimeoutRef.current =
        window.setTimeout(() => {
          setVisibleStageCount(
            nextCount
          );

          revealNextStage(
            nextCount + 1
          );
        }, STAGE_REVEAL_DELAY_MS);
    }

    revealNextStage(1);

    return () => {
      if (
        animationTimeoutRef.current
      ) {
        window.clearTimeout(
          animationTimeoutRef.current
        );
      }
    };
  }, [
    selectedConversationIndex,
    stages.length,
  ]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const stopCurrentAudio =
    useCallback(() => {
      if (!audioRef.current) {
        return;
      }

      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";

      setActiveAudioPath(null);
      setIsAudioPlaying(false);
    }, []);

  const handleConversationChange =
    useCallback(
      (nextIndex) => {
        stopCurrentAudio();

        const boundedIndex =
          Math.min(
            Math.max(nextIndex, 0),
            conversations.length - 1
          );

        setSelectedConversationIndex(
          boundedIndex
        );
      },
      [
        conversations.length,
        stopCurrentAudio,
      ]
    );

  const handleAudioToggle =
    useCallback(
      async (audioPath) => {
        if (!audioPath) {
          return;
        }

        if (
          activeAudioPath === audioPath &&
          audioRef.current
        ) {
          if (audioRef.current.paused) {
            try {
              await audioRef.current.play();
              setIsAudioPlaying(true);
            } catch (error) {
              console.error(
                "Could not resume Roper audio:",
                error
              );

              setErrorMessage(
                "The recording could not be played."
              );
            }
          } else {
            audioRef.current.pause();
            setIsAudioPlaying(false);
          }

          return;
        }

        setLoadingAudioPath(audioPath);
        setErrorMessage("");

        try {
          stopCurrentAudio();

          const signedUrl =
            await createRoperSignedAudioUrl(
              audioPath,
              120
            );

          const audio = new Audio(
            signedUrl
          );

          audioRef.current = audio;

          audio.addEventListener(
            "play",
            () => {
              setIsAudioPlaying(true);
            }
          );

          audio.addEventListener(
            "pause",
            () => {
              setIsAudioPlaying(false);
            }
          );

          audio.addEventListener(
            "ended",
            () => {
              setIsAudioPlaying(false);
              setActiveAudioPath(null);
            }
          );

          audio.addEventListener(
            "error",
            () => {
              setIsAudioPlaying(false);
              setActiveAudioPath(null);

              setErrorMessage(
                "One of the recordings could not be played."
              );
            }
          );

          setActiveAudioPath(
            audioPath
          );

          await audio.play();
        } catch (error) {
          console.error(
            "Could not play Roper recording:",
            error
          );

          setActiveAudioPath(null);
          setIsAudioPlaying(false);

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "The recording could not be played."
          );
        } finally {
          setLoadingAudioPath(null);
        }
      },
      [
        activeAudioPath,
        stopCurrentAudio,
      ]
    );

  if (isLoading) {
    return (
      <section className="roper-reveal-state">
        <LoaderCircle
          className="roper-spin"
          aria-hidden="true"
          size={38}
        />

        <p className="activity-placeholder__label">
          Preparing the reveal
        </p>

        <h2>
          Gathering every misunderstanding...
        </h2>
      </section>
    );
  }

  if (
    errorMessage &&
    !revealResult
  ) {
    return (
      <section className="roper-reveal-state">
        <AlertTriangle
          aria-hidden="true"
          size={38}
        />

        <p className="activity-placeholder__label">
          Reveal unavailable
        </p>

        <h2>
          The misunderstanding could not be
          loaded.
        </h2>

        <p>{errorMessage}</p>

        <button
          type="button"
          className="primary-button"
          onClick={loadReveal}
        >
          <RotateCcw
            aria-hidden="true"
            size={18}
          />
          Try Again
        </button>
      </section>
    );
  }

  if (
    revealResult?.status === "locked"
  ) {
    return (
      <section className="roper-reveal-state">
        <Clock3
          aria-hidden="true"
          size={38}
        />

        <p className="activity-placeholder__label">
          Come back tonight
        </p>

        <h2>
          The misunderstanding is still under
          wraps.
        </h2>

        <p>
          Every recording and final guess will
          be revealed after{" "}
          <strong>
            {formatRevealDate(
              revealResult?.reveal_at
            )}
          </strong>
          .
        </p>
      </section>
    );
  }

  if (
    revealResult?.status ===
    "unavailable"
  ) {
    return (
      <section className="roper-reveal-state">
        <AlertTriangle
          aria-hidden="true"
          size={38}
        />

        <p className="activity-placeholder__label">
          Reveal unavailable
        </p>

        <h2>
          There is no reveal scheduled.
        </h2>

        <p>
          {revealResult?.message ??
            "No reveal time has been configured."}
        </p>
      </section>
    );
  }

  if (
    revealResult?.status !==
    "revealed"
  ) {
    return (
      <section className="roper-reveal-state">
        <AlertTriangle
          aria-hidden="true"
          size={38}
        />

        <p className="activity-placeholder__label">
          Unexpected response
        </p>

        <h2>
          The reveal returned an unfamiliar
          status.
        </h2>
      </section>
    );
  }

  if (conversations.length === 0) {
    return (
      <section className="roper-reveal-state">
        <Headphones
          aria-hidden="true"
          size={38}
        />

        <p className="activity-placeholder__label">
          Nothing to reveal
        </p>

        <h2>
          No conversations were completed.
        </h2>

        <p>
          Apparently the misunderstanding ended
          before anyone had the chance to make
          it worse.
        </p>
      </section>
    );
  }

  return (
    <section className="roper-reveal">
      <header className="roper-reveal__header">
        <p className="activity-placeholder__label">
          The complete misunderstanding
        </p>

        <h2>
          Here&apos;s what everyone thought
          they heard.
        </h2>

        <p>
          Each participant heard the previous
          recording only once, typed what they
          believed they heard, and passed their
          version to the next person.
        </p>
      </header>

      {conversations.length > 1 && (
        <nav
          className="roper-conversation-nav"
          aria-label="Choose a completed conversation"
        >
          <button
            type="button"
            className="roper-conversation-nav__arrow"
            onClick={() =>
              handleConversationChange(
                selectedConversationIndex - 1
              )
            }
            disabled={
              selectedConversationIndex === 0
            }
            aria-label="Previous conversation"
          >
            <ChevronLeft
              aria-hidden="true"
              size={20}
            />
          </button>

          <div className="roper-conversation-tabs">
            {conversations.map(
              (conversation, index) => (
                <button
                  key={
                    conversation?.conversation_id ??
                    index
                  }
                  type="button"
                  className={[
                    "roper-conversation-tab",
                    index ===
                    selectedConversationIndex
                      ? "roper-conversation-tab--active"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() =>
                    handleConversationChange(
                      index
                    )
                  }
                >
                  {formatConversationLabel(
                    conversation,
                    index
                  )}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            className="roper-conversation-nav__arrow"
            onClick={() =>
              handleConversationChange(
                selectedConversationIndex + 1
              )
            }
            disabled={
              selectedConversationIndex ===
              conversations.length - 1
            }
            aria-label="Next conversation"
          >
            <ChevronRight
              aria-hidden="true"
              size={20}
            />
          </button>
        </nav>
      )}

      <div
        className="roper-reveal__conversation"
        key={
          selectedConversation?.conversation_id ??
          selectedConversationIndex
        }
      >
        <article className="roper-original-card roper-reveal-enter">
          <div className="roper-original-card__icon">
            <Volume2
              aria-hidden="true"
              size={24}
            />
          </div>

          <div>
            <p className="roper-stage-card__eyebrow">
              Original Phrase
            </p>

            {selectedConversation?.character_name && (
              <p className="roper-original-card__character">
                {
                  selectedConversation.character_name
                }
              </p>
            )}

            <blockquote>
              “
              {selectedConversation?.original_phrase ??
                "Original phrase unavailable."}
              ”
            </blockquote>
          </div>
        </article>

        <div className="roper-timeline">
          {stages.map(
            (stage, index) => {
              const isVisible =
                index <
                visibleStageCount;

              const audioPath =
                stage?.audio_path;

              const hasRecording =
                Boolean(
                  stage?.has_recording &&
                  audioPath
                );

              const isLoadingThisAudio =
                loadingAudioPath ===
                audioPath;

              const isThisAudioPlaying =
                activeAudioPath ===
                  audioPath &&
                isAudioPlaying;

              return (
                <div
                  key={`${stage?.turn_number ?? index}-${audioPath ?? "text"}`}
                  className={[
                    "roper-timeline__entry",
                    isVisible
                      ? "roper-timeline__entry--visible"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden={
                    !isVisible
                  }
                >
                  <div className="roper-timeline__marker">
                    {Number(
                      stage?.turn_number
                    ) === 5 ? (
                      <Check
                        aria-hidden="true"
                        size={18}
                      />
                    ) : (
                      Number(
                        stage?.turn_number
                      )
                    )}
                  </div>

                  <article className="roper-stage-card">
                    <p className="roper-stage-card__eyebrow">
                      {getStageTitle(
                        stage,
                        stages.length
                      )}
                    </p>

                    <h3>
                      {getStageSubtitle(
                        stage
                      )}
                    </h3>

                    <blockquote>
                      “
                      {stage?.written_phrase ??
                        "No written phrase was saved."}
                      ”
                    </blockquote>

                    {hasRecording ? (
                      <button
                        type="button"
                        className={[
                          "roper-audio-button",
                          isThisAudioPlaying
                            ? "roper-audio-button--playing"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() =>
                          handleAudioToggle(
                            audioPath
                          )
                        }
                        disabled={
                          isLoadingThisAudio
                        }
                      >
                        {isLoadingThisAudio ? (
                          <LoaderCircle
                            className="roper-spin"
                            aria-hidden="true"
                            size={19}
                          />
                        ) : isThisAudioPlaying ? (
                          <Pause
                            aria-hidden="true"
                            size={19}
                          />
                        ) : (
                          <Play
                            aria-hidden="true"
                            size={19}
                          />
                        )}

                        {isLoadingThisAudio
                          ? "Loading Recording..."
                          : isThisAudioPlaying
                            ? "Pause Recording"
                            : "Play Recording"}
                      </button>
                    ) : Number(
                        stage?.turn_number
                      ) < 5 ? (
                      <p className="roper-stage-card__missing-audio">
                        Recording unavailable
                      </p>
                    ) : null}
                  </article>

                  {index <
                    stages.length - 1 && (
                    <ArrowDown
                      className="roper-timeline__arrow"
                      aria-hidden="true"
                      size={22}
                    />
                  )}
                </div>
              );
            }
          )}
        </div>

        {visibleStageCount >=
          stages.length &&
          finalStage && (
            <section className="roper-final-comparison roper-reveal-enter">
              <p className="activity-placeholder__label">
                Where it started
              </p>

              <blockquote>
                “
                {selectedConversation?.original_phrase ??
                  "Original phrase unavailable."}
                ”
              </blockquote>

              <ArrowDown
                aria-hidden="true"
                size={28}
              />

              <p className="activity-placeholder__label">
                What Mr. Roper finally heard
              </p>

              <blockquote>
                “
                {finalStage?.written_phrase ??
                  "Final phrase unavailable."}
                ”
              </blockquote>

              <p className="roper-final-comparison__ending">
                Five people. One sentence.
                Absolute disaster.
              </p>
            </section>
          )}
      </div>

      {errorMessage && (
        <div
          className="roper-inline-error"
          role="alert"
        >
          <AlertTriangle
            aria-hidden="true"
            size={20}
          />

          <p>{errorMessage}</p>
        </div>
      )}
    </section>
  );
}

export default RoperRevealExperience;