import React, { useEffect, useRef } from "react";
import { ensureButtonStyles } from "../buttonStyles";


function ringOnce(audioCtx) {
  const now = audioCtx.currentTime;
  [660, 880].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + i * 0.22);
    gain.gain.exponentialRampToValueAtTime(0.25, now + i * 0.22 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.22 + 0.2);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now + i * 0.22);
    osc.stop(now + i * 0.22 + 0.22);
  });
}

export default function AlarmOverlay({ block, audioCtx, onAccept, onSnooze }) {
  const intervalRef = useRef(null);

  useEffect(() => {
    ensureButtonStyles();
    // Guard on BOTH audioCtx and block. audioCtx becomes truthy the
    // moment sound is turned on in App.js -- well before any alarm is
    // actually due. Without also checking `block` here, this effect
    // would start ringing immediately (and forever, via the interval
    // below) any time sound is enabled, even with no alarm active.
    if (!audioCtx || !block) return undefined;

    ringOnce(audioCtx);
    intervalRef.current = setInterval(() => ringOnce(audioCtx), 1600);

    if (navigator.vibrate) {
      navigator.vibrate([400, 200, 400, 200, 400]);
    }

    const prevTitle = document.title;
    let blink = false;
    const titleInterval = setInterval(() => {
      document.title = blink ? "StudyBell — time!" : "⏰ It's time";
      blink = !blink;
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(titleInterval);
      document.title = prevTitle;
    };
  }, [audioCtx, block]);

  if (!block) return null;

  return (
    <div style={styles.backdrop} role="alertdialog" aria-modal="true" aria-label="Schedule alarm">
      <div style={styles.card}>
        <p style={styles.eyebrow}>It's time for</p>
        <h1 style={styles.title}>{block.title}</h1>
        <p style={styles.time}>Scheduled for {block.time}</p>

        <div style={styles.pulseWrap}>
          <div style={styles.pulseRing} />
          <div style={styles.pulseCore}>⏰</div>
        </div>

        <div style={styles.buttonRow}>
          <button type="button" className="sb-btn" style={styles.snoozeBtn} onClick={onSnooze}>
            Snooze 5 min
          </button>
          <button type="button" className="sb-btn" style={styles.acceptBtn} onClick={onAccept}>
            I'm ready
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(10, 14, 22, 0.92)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  card: {
    width: "min(420px, 90vw)",
    background: "#0f1622",
    border: "1px solid #24314a",
    borderRadius: "16px",
    padding: "32px 28px",
    textAlign: "center",
    color: "#eef1f6",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  },
  eyebrow: {
    margin: 0,
    fontSize: "13px",
    letterSpacing: "0.04em",
    color: "#8fa1c4",
  },
  title: {
    margin: "8px 0 4px",
    fontSize: "24px",
    fontWeight: 600,
    lineHeight: 1.3,
  },
  time: {
    margin: "0 0 20px",
    fontSize: "14px",
    color: "#8fa1c4",
  },
  pulseWrap: {
    position: "relative",
    width: "96px",
    height: "96px",
    margin: "0 auto 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    background: "rgba(201, 161, 92, 0.25)",
    animation: "studybell-pulse 1.6s ease-out infinite",
  },
  pulseCore: {
    position: "relative",
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: "#c9a15c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },
  snoozeBtn: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #2c3a56",
    background: "transparent",
    color: "#c3cde3",
    fontSize: "14px",
    cursor: "pointer",
  },
  acceptBtn: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#4f9d69",
    color: "#0b1a10",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
};

// Global keyframes injected once -- kept out of index.css on purpose so
// this component is fully self-contained.
const styleTagId = "studybell-alarm-keyframes";
if (typeof document !== "undefined" && !document.getElementById(styleTagId)) {
  const styleTag = document.createElement("style");
  styleTag.id = styleTagId;
  styleTag.textContent = `
    @keyframes studybell-pulse {
      0% { transform: scale(0.9); opacity: 0.9; }
      100% { transform: scale(1.9); opacity: 0; }
    }
  `;
  document.head.appendChild(styleTag);
}