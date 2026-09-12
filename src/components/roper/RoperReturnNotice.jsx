import { Clock3, Film } from "lucide-react";

function RoperReturnNotice({
  completed = false,
}) {
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
            : "Come back September 26"}
        </p>

        <p className="roper-return-notice__message">
          {completed ? (
            <>
              You have completed the
              misunderstanding. Check back after
              7:00 p.m. on September 26 to hear the
              entire chain or start a new one!
            </>
          ) : (
            <>
              Check back after 7:00 p.m. on
              September 26 to hear every recording
              and watch the whole misunderstanding
              unfold.
            </>
          )}
        </p>
      </div>
    </aside>
  );
}

export default RoperReturnNotice;
