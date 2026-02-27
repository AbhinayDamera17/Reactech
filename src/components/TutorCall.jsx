import { useState, useCallback } from "react";
import { Conversation } from "./cvi/components/conversation";

export default function TutorCall({ currentReaction = null }) {
  const [conversationUrl, setConversationUrl] = useState(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);
  const [active, setActive]                 = useState(false);

  const buildContext = useCallback(() => {
    if (currentReaction) {
      return (
        `You are a friendly, expert chemistry tutor named "Dr. React" helping a student ` +
        `in a virtual chemistry lab called Reactech. ` +
        `The student is currently working on the following reaction:\n` +
        `  Chemical A : ${currentReaction.chem1 ?? "unknown"}\n` +
        `  Chemical B : ${currentReaction.chem2 ?? "unknown"}\n` +
        `  Products   : ${currentReaction.products ?? "unknown"}\n` +
        `  Risk level : ${currentReaction.risk ?? "unknown"}\n\n` +
        `Guide the student through the science, explain what is happening at the ` +
        `molecular level, highlight any safety precautions they should take, and ` +
        `encourage curiosity. Keep explanations concise and engaging. ` +
        `Start by greeting the student and briefly introducing the reaction they are working on.`
      );
    }
    return (
      `You are a friendly, expert chemistry tutor named "Dr. React" helping a student ` +
      `in a virtual chemistry lab called Reactech. ` +
      `Help the student understand chemical reactions, safety precautions, ` +
      `and the science behind what they observe. Be encouraging and concise. ` +
      `Start by greeting the student warmly and asking what they would like to learn today.`
    );
  }, [currentReaction]);

  const startCall = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://tavusapi.com/v2/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_TAVUS_API_KEY,
        },
        body: JSON.stringify({
          replica_id: import.meta.env.VITE_TAVUS_REPLICA_ID,
          persona_id: import.meta.env.VITE_TAVUS_PERSONA_ID,
          conversational_context: buildContext(),
          conversation_name: `Reactech Lab Session — ${new Date().toLocaleTimeString()}`,
          properties: {
            max_call_duration: 600,
            enable_recording: false,
            participant_left_timeout: 60,
            enable_transcription: true,
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("[TutorCall] Tavus error:", response.status, errData);
        throw new Error(errData?.message ?? `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.conversation_url) {
        throw new Error("No conversation URL returned from Tavus API.");
      }

      setConversationUrl(data.conversation_url);
      setActive(true);
    } catch (err) {
      console.error("[TutorCall] Failed to start Tavus call:", err);
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [buildContext]);

  const endCall = useCallback(() => {
    setActive(false);
    setConversationUrl(null);
    setError(null);
  }, []);

  if (active && conversationUrl) {
    return (
      <div className="tutor-call-container">
        <div className="tutor-call-header">
          <div className="tutor-call-title">
            <span className="tutor-call-dot" />
            <span>🎓 Chemistry Tutor — Live</span>
          </div>
          <button className="end-call-btn" onClick={endCall}>
            ✕ End Call
          </button>
        </div>

        {currentReaction && (
          <div className="tutor-call-context-badge">
            🧪 {currentReaction.chem1} + {currentReaction.chem2}
            <span className={`risk-pill risk-pill--${currentReaction.risk ?? "unknown"}`}>
              {currentReaction.risk ?? "?"}
            </span>
          </div>
        )}

        <div className="tutor-call-video-wrapper">
          <Conversation
            conversationUrl={conversationUrl}
            onLeave={endCall}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-call-idle">
      {error && (
        <div className="tutor-call-error">
          ⚠️ {error}
        </div>
      )}

      <button
        className="start-tutor-btn"
        onClick={startCall}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="tutor-btn-spinner" />
            Connecting…
          </>
        ) : (
          <>📹 Call Chemistry Tutor</>
        )}
      </button>

      {currentReaction && (
        <p className="tutor-call-hint">
          Tutor will be briefed on your current reaction
        </p>
      )}
    </div>
  );
}