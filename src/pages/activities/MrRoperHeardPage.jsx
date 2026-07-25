import {
  useEffect,
  useState,
} from "react";
import { Ear } from "lucide-react";

import ActivityLayout from "../../layouts/ActivityLayout";

import FutureTurnGameplay from "../../components/roper/FutureTurnGameplay";
import TurnOneRecorder from "../../components/roper/TurnOneRecorder";

import {
  RoperCompletionPanel,
  RoperErrorPanel,
  RoperLoadingPanel,
  RoperRevealPanel,
  RoperUnavailablePanel,
  RoperWaitingPanel,
} from "../../components/roper/RoperStatusPanels";

import {
  getClaimStatus,
  getTurnNumber,
  PAGE_STATES,
} from "../../components/roper/roperUtils";

import {
  claimRoperTurn,
  getRoperActivityState,
} from "../../lib/roperService";

function MrRoperHeardPage() {
  const [pageState, setPageState] =
    useState(PAGE_STATES.LOADING);

  const [activityState, setActivityState] =
    useState(null);

  const [claimResult, setClaimResult] =
    useState(null);

  const [completionResult, setCompletionResult] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  

  useEffect(() => {
    let isCancelled = false;

    async function initializeRoperActivity() {
      try {
        setPageState(
          PAGE_STATES.LOADING
        );

        setErrorMessage("");

        const currentActivityState =
          await getRoperActivityState();

        if (isCancelled) {
          return;
        }

        setActivityState(
          currentActivityState
        );

        if (
          currentActivityState?.mode ===
          "reveal"
        ) {
          setPageState(
            PAGE_STATES.REVEAL
          );

          return;
        }

        const currentClaimResult =
          await claimRoperTurn();

        if (isCancelled) {
          return;
        }

        setClaimResult(
          currentClaimResult
        );

        const claimStatus =
          getClaimStatus(
            currentClaimResult
          );

        switch (claimStatus) {
          case "claimed":
          case "resumed":
          case "your_turn":
            setPageState(
              PAGE_STATES.ACTIVE_TURN
            );
            break;

          case "waiting":
            setPageState(
              PAGE_STATES.WAITING
            );
            break;

          case "reveal":
            setPageState(
              PAGE_STATES.REVEAL
            );
            break;

          case "unavailable":
          case "complete":
          case "closed":
            setPageState(
              PAGE_STATES.UNAVAILABLE
            );
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

        setPageState(
          PAGE_STATES.ERROR
        );
      }
    }

    initializeRoperActivity();

    return () => {
      isCancelled = true;
    };
  }, []);

  function handleTurnCompleted(result) {
    setCompletionResult(result);

    setPageState(
      PAGE_STATES.COMPLETED
    );
  }

  function handlePhraseSubmitted(result) {
  console.info(
    "Roper phrase submission complete:",
    result
  );
}

  const turnNumber =
    getTurnNumber(claimResult);

  const isTurnOne =
    turnNumber === 1;

  const requiresRecording =
    claimResult?.requires_recording !==
    false;

  return (
    <ActivityLayout
      eyebrow="The Great Hastings Misunderstanding"
      title="What Did Mr. Roper Hear?"
      description="Listen carefully, type what you heard, and record the next version of the phrase."
      icon={Ear}
    >
      {pageState ===
        PAGE_STATES.LOADING && (
        <RoperLoadingPanel />
      )}

      {pageState ===
        PAGE_STATES.ACTIVE_TURN &&
        isTurnOne &&
        requiresRecording && (
          <TurnOneRecorder
            claimResult={claimResult}
            onCompleted={
              handleTurnCompleted
            }
          />
        )}

      {pageState ===
        PAGE_STATES.ACTIVE_TURN &&
        turnNumber >= 2 &&
        turnNumber <= 5 && (
          <FutureTurnGameplay
            claimResult={claimResult}
            onPhraseSubmitted={
              handlePhraseSubmitted
            }
          />
        )}

      {pageState ===
        PAGE_STATES.ACTIVE_TURN &&
        !isTurnOne &&
        !(
          turnNumber >= 2 &&
          turnNumber <= 5
        ) && (
          <div className="activity-placeholder">
            <p className="activity-placeholder__label">
              Unsupported turn
            </p>

            <h2>
              This turn number is not
              recognized.
            </h2>

            <p>
              Received turn:{" "}
              {turnNumber ?? "missing"}
            </p>
          </div>
        )}

      {pageState ===
        PAGE_STATES.COMPLETED && (
        <RoperCompletionPanel
          completionResult={
            completionResult
          }
        />
      )}

      {pageState ===
        PAGE_STATES.WAITING && (
        <RoperWaitingPanel
          claimResult={claimResult}
        />
      )}

      {pageState ===
        PAGE_STATES.REVEAL && (
        <RoperRevealPanel
          activityState={activityState}
        />
      )}

      {pageState ===
        PAGE_STATES.UNAVAILABLE && (
        <RoperUnavailablePanel />
      )}

      {pageState ===
        PAGE_STATES.ERROR && (
        <RoperErrorPanel
          errorMessage={errorMessage}
        />
      )}
    </ActivityLayout>
  );
}

export default MrRoperHeardPage;