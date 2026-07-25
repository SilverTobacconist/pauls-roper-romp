import {
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

export function RoperLoadingPanel() {
  return (
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
  );
}



export function RoperRevealPanel({
  activityState,
}) {
  return (
    <div className="activity-placeholder">
      <p className="activity-placeholder__label">
        Conversations revealed
      </p>

      <h2>Mr. Roper has heard enough.</h2>

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
  );
}

export function RoperUnavailablePanel() {
  return (
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
  );
}

export function RoperErrorPanel({
  errorMessage,
}) {
  return (
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
  );
}

export function RoperCompletionPanel({
  completionResult,
}) {
  return (
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
  );
}

export function RoperFutureTurnPanel({
  claimResult,
}) {
  return (
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
  );
}