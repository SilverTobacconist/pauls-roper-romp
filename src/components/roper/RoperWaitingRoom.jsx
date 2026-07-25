import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Clock3,
  LoaderCircle,
  Radio,
} from "lucide-react";

import {
  claimRoperTurn,
  getRoperWaitingState,
  subscribeToRoperWaitingRoom,
  unsubscribeFromRoperChannel,
} from "../../lib/roperService";

import {
  getClaimStatus,
} from "./roperUtils";

const RETRY_INTERVAL_MS = 5000;

function getSecondsRemaining(result) {
  const value =
    result?.seconds_remaining ??
    result?.secondsRemaining ??
    result?.reservation_seconds_remaining ??
    result?.reservationSecondsRemaining;

  const seconds = Number(value);

  return Number.isFinite(seconds)
    ? Math.max(0, seconds)
    : null;
}

function RoperWaitingRoom({
  initialWaitingState,
  onTurnClaimed,
  onReveal,
  onUnavailable,
  onError,
}) {
  const [waitingState, setWaitingState] =
    useState(initialWaitingState);

  const [
    secondsRemaining,
    setSecondsRemaining,
  ] = useState(() =>
    getSecondsRemaining(
      initialWaitingState
    )
  );

  const [isChecking, setIsChecking] =
    useState(false);

  const [statusMessage, setStatusMessage] =
    useState(
      "Waiting for the current turn to finish."
    );

  const realtimeChannelRef =
    useRef(null);

  const retryIntervalRef =
    useRef(null);

  const countdownIntervalRef =
    useRef(null);

  const isCheckingRef =
    useRef(false);

  const isMountedRef =
    useRef(true);

  const handleClaimResult =
    useCallback(
      (claimResult) => {
        const claimStatus =
          getClaimStatus(
            claimResult
          );

        switch (claimStatus) {
          case "claimed":
          case "resumed":
          case "your_turn":
            onTurnClaimed(
              claimResult
            );
            return true;

          case "reveal":
            onReveal?.(
              claimResult
            );
            return true;

          case "unavailable":
          case "complete":
          case "closed":
            onUnavailable?.(
              claimResult
            );
            return true;

          case "waiting":
            setWaitingState(
              claimResult
            );

            setSecondsRemaining(
              getSecondsRemaining(
                claimResult
              )
            );

            return false;

          default:
            throw new Error(
              `Unexpected waiting-room claim status: ${
                claimStatus || "missing"
              }`
            );
        }
      },
      [
        onReveal,
        onTurnClaimed,
        onUnavailable,
      ]
    );

  const checkForAvailableTurn =
    useCallback(
      async ({
        showCheckingState = false,
      } = {}) => {
        if (
          isCheckingRef.current ||
          !isMountedRef.current
        ) {
          return;
        }

        isCheckingRef.current = true;

        if (showCheckingState) {
          setIsChecking(true);

          setStatusMessage(
            "Checking the hallway..."
          );
        }

        try {
          const claimResult =
            await claimRoperTurn();

          if (!isMountedRef.current) {
            return;
          }

          const didLeaveWaitingRoom =
            handleClaimResult(
              claimResult
            );

          if (
            !didLeaveWaitingRoom
          ) {
            setStatusMessage(
              "The current turn is still in progress."
            );
          }
        } catch (error) {
          console.error(
            "Could not check for an available Roper turn:",
            error
          );

          if (
            isMountedRef.current
          ) {
            setStatusMessage(
              "Still waiting. The next check will happen automatically."
            );
          }
        } finally {
          isCheckingRef.current =
            false;

          if (
            isMountedRef.current
          ) {
            setIsChecking(false);
          }
        }
      },
      [handleClaimResult]
    );

  const refreshWaitingState =
    useCallback(async () => {
      try {
        const nextWaitingState =
          await getRoperWaitingState();

        if (!isMountedRef.current) {
          return;
        }

        if (
          nextWaitingState
        ) {
          setWaitingState(
            nextWaitingState
          );

          setSecondsRemaining(
            getSecondsRemaining(
              nextWaitingState
            )
          );
        }

        await checkForAvailableTurn();
      } catch (error) {
        console.error(
          "Could not refresh the Roper waiting state:",
          error
        );
      }
    }, [
      checkForAvailableTurn,
    ]);

  useEffect(() => {
    isMountedRef.current = true;

    retryIntervalRef.current =
      window.setInterval(() => {
        checkForAvailableTurn();
      }, RETRY_INTERVAL_MS);

    countdownIntervalRef.current =
      window.setInterval(() => {
        setSecondsRemaining(
          (currentSeconds) => {
            if (
              currentSeconds === null
            ) {
              return null;
            }

            return Math.max(
              0,
              currentSeconds - 1
            );
          }
        );
      }, 1000);

    async function beginRealtimeSubscription() {
      try {
        const channel =
          await subscribeToRoperWaitingRoom(
            () => {
              refreshWaitingState();
            }
          );

        if (!isMountedRef.current) {
          if (channel) {
            await unsubscribeFromRoperChannel(
              channel
            );
          }

          return;
        }

        realtimeChannelRef.current =
          channel;
      } catch (error) {
        console.error(
          "Could not subscribe to the Roper waiting room:",
          error
        );

        /*
         * Polling remains active, so the
         * waiting room still works even if
         * Realtime briefly fails.
         */
      }
    }

    beginRealtimeSubscription();

    return () => {
      isMountedRef.current = false;

      if (
        retryIntervalRef.current
      ) {
        window.clearInterval(
          retryIntervalRef.current
        );

        retryIntervalRef.current =
          null;
      }

      if (
        countdownIntervalRef.current
      ) {
        window.clearInterval(
          countdownIntervalRef.current
        );

        countdownIntervalRef.current =
          null;
      }

      if (
        realtimeChannelRef.current
      ) {
        unsubscribeFromRoperChannel(
          realtimeChannelRef.current
        );

        realtimeChannelRef.current =
          null;
      }
    };
  }, [
    checkForAvailableTurn,
    refreshWaitingState,
  ]);

  const displayedSeconds =
    secondsRemaining === null
      ? null
      : Math.max(
          0,
          Math.ceil(
            secondsRemaining
          )
        );

  return (
    <div
      className="activity-placeholder"
      role="status"
      aria-live="polite"
    >
      <Radio
        aria-hidden="true"
        size={36}
      />

      <p className="activity-placeholder__label">
        Waiting room
      </p>

      <h2>
        Someone else has the hallway.
      </h2>

      <p>
        Your turn will begin automatically
        when the current reservation ends or
        the participant finishes.
      </p>

      {displayedSeconds !== null && (
        <div className="activity-placeholder__details">
          <Clock3
            aria-hidden="true"
            size={24}
          />

          <p>
            Current reservation:
          </p>

          <p>
            <strong>
              {displayedSeconds}{" "}
              {displayedSeconds === 1
                ? "second"
                : "seconds"}
            </strong>
          </p>
        </div>
      )}

      {waitingState?.waiting_ahead !=
        null && (
        <p>
          Participants ahead of you:{" "}
          <strong>
            {waitingState.waiting_ahead}
          </strong>
        </p>
      )}

      <div>
        {isChecking && (
          <LoaderCircle
            aria-hidden="true"
            size={24}
          />
        )}

        <p>{statusMessage}</p>
      </div>

      <button
        className="primary-button"
        type="button"
        onClick={() => {
          checkForAvailableTurn({
            showCheckingState: true,
          });
        }}
        disabled={isChecking}
      >
        {isChecking ? (
          <>
            <LoaderCircle
              aria-hidden="true"
              size={19}
            />
            Checking...
          </>
        ) : (
          <>
            <Radio
              aria-hidden="true"
              size={19}
            />
            Check Now
          </>
        )}
      </button>

      <p>
        Keep this page open. No refreshing is
        required.
      </p>
    </div>
  );
}

export default RoperWaitingRoom;