import React, { useEffect, useState } from "react";
import { EyeOff } from "lucide-react";
import { ensureButtonStyles } from "../buttonStyles";
import { toMinutes, findCurrentIndex } from "../scheduleTime";
import { categorize } from "../categorize";

function pad(n) {
  return String(n).padStart(2, "0");
}

function format(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

// Big countdown for whatever block is happening right now. It follows the
// schedule on its own: when one block ends it rolls over to the next one.
export default function TimerOverlay({ blocks, onHide }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    ensureButtonStyles();
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const idx = findCurrentIndex(blocks, Math.floor(nowSec / 60));

  let label = "";
  let title = "";
  let remaining = 0;
  let progress = 0;
  let endText = "";
  let color = "#c9a15c";

  if (idx !== -1) {
    const block = blocks[idx];
    const startSec = toMinutes(block.time) * 60;
    const endSec = (idx + 1 < blocks.length ? toMinutes(blocks[idx + 1].time) : 24 * 60) * 60;
    remaining = endSec - nowSec;
    progress = Math.min(1, Math.max(0, (nowSec - startSec) / (endSec - startSec)));
    label = "Right now";
    title = block.title;
    color = categorize(block.title).color;
    endText = `Ends at ${idx + 1 < blocks.length ? blocks[idx + 1].time : "24:00"}`;
  } else {
    const next = blocks.find((b) => toMinutes(b.time) * 60 > nowSec);
    if (next) {
      remaining = toMinutes(next.time) * 60 - nowSec;
      label = "Starts in";
      title = next.title;
      color = categorize(next.title).color;
      endText = `Starts at ${next.time}`;
    } else {
      label = "Done";
      title = "Nothing left today";
    }
  }

  return (
    <div style={styles.backdrop} role="dialog" aria-label="Timer">
      <div style={styles.card}>
        <p style={styles.label}>{label}</p>
        <h1 style={{ ...styles.title, color }}>{title}</h1>
        <div style={styles.time}>{format(remaining)}</div>
        {endText && <p style={styles.endText}>{endText}</p>}
        {idx !== -1 && (
          <div style={styles.barTrack}>
            <div style={{ ...styles.barFill, width: `${progress * 100}%`, background: color }} />
          </div>
        )}
        <button type="button" className="sb-btn" style={styles.hideBtn} onClick={onHide}>
          <EyeOff size={18} />
          Hide timer
        </button>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(6, 9, 15, 0.96)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 800,
  },
  card: {
    width: "min(720px, 100%)",
    textAlign: "center",
    color: "#eef1f6",
  },
  label: {
    margin: 0,
    fontSize: "14px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#8fa1c4",
  },
  title: {
    margin: "12px 0 8px",
    fontSize: "clamp(24px, 5vw, 40px)",
    fontWeight: 700,
    lineHeight: 1.25,
  },
  time: {
    fontSize: "clamp(72px, 22vw, 190px)",
    fontWeight: 800,
    lineHeight: 1.05,
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "-0.02em",
    margin: "8px 0",
  },
  endText: {
    margin: "0 0 20px",
    fontSize: "15px",
    color: "#8fa1c4",
  },
  barTrack: {
    height: "6px",
    borderRadius: "999px",
    background: "#1e2636",
    overflow: "hidden",
    maxWidth: "420px",
    margin: "0 auto 32px",
  },
  barFill: {
    height: "100%",
    borderRadius: "999px",
    transition: "width 1s linear",
  },
  hideBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 26px",
    borderRadius: "10px",
    border: "1px solid #2c3a56",
    background: "#141d2c",
    color: "#eef1f6",
    fontSize: "15px",
    cursor: "pointer",
  },
};