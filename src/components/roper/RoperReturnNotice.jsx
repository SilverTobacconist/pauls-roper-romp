import { Clock3, Film } from "lucide-react";

function formatRevealTime(revealAt) {
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

function RoperReturnNotice({
  revealAt,
  completed = false,
}) {
  const revealTime =
    formatRevealTime(revealAt);

  return (
    <aside
      className={[
        "roper-return-notice",
        completed
          ? "roper-return-notice--completed"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="roper-return-notice__icon">
        {completed ? (
          <Film
            aria-hidden="true"
            size={24}
          />
        ) : (
          <Clock3
            aria-hidden="true"
            size={22}
          />
        )}
      </div>

      <div>
        <p className="roper-return-notice__label">
          {completed
            ? "Your part is complete"
            : "Come back tonight"}
        </p>

        <p className="roper-return-notice__message">
          {completed ? (
            <>
              The complete misunderstanding
              will be revealed after{" "}
              <strong>{revealTime}</strong>.
              Return to this website tonight to hear every
              recording and see how the phrase
              changed from beginning to end.
            </>
          ) : (
            <>
              Return to this website after{" "}
              <strong>{revealTime}</strong> to
              hear every recording and watch the
              whole misunderstanding unfold.
            </>
          )}
        </p>
      </div>
    </aside>
  );
}

export default RoperReturnNotice;