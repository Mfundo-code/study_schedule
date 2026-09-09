import React, { useCallback, useEffect, useRef, useState } from "react";
import { Settings, Volume2, BellRing } from "lucide-react";
import {
  getToday,
  getState,
  checkin,
  scheduleNext,
  cancelSchedule,
  resetProgram,
  todayLocalISO,
} from "./api";
import ProgramControl from "./components/ProgramControl";
import ScheduleList from "./components/ScheduleList";
import AlarmOverlay from "./components/AlarmOverlay";
import { ensureButtonStyles } from "./buttonStyles";
import { findCurrentBlock } from "./scheduleTime";

function nowKey(dateISO, block) {
  return `studybell:${dateISO}:${block.time}:${block.title}`;
}

export default function App() {
  const [status, setStatus] = useState("loading"); // loading | idle | active | sunday | done
  const [dayNumber, setDayNumber] = useState(null);
  const [review, setReview] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [progress, setProgress] = useState({
    next_day_number: 1,
    scheduled_next_date: null,
    last_active_date: null,
  });
  const [nowMinutes, setNowMinutes] = useState(0);
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [snoozedUntil, setSnoozedUntil] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [controlOpen, setControlOpen] = useState(false);
  const audioCtxRef = useRef(null);
  const dateISO = todayLocalISO();

  useEffect(() => {
    ensureButtonStyles();
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [today, state] = await Promise.all([getToday(), getState()]);
      setStatus(today.status);
      if (today.status === "active") {
        setDayNumber(today.day_number);
        setReview(!!today.review);
        setBlocks(today.blocks);
      }
      setProgress(state);
      setError("");
    } catch (err) {
      setError("Couldn't reach the backend. Is Django running on port 8000?");
    }
  }, []);

  useEffect(() => {
    refresh();
    const poll = setInterval(refresh, 20000);
    return () => clearInterval(poll);
  }, [refresh]);

  useEffect(() => {
    const clock = setInterval(() => {
      const d = new Date();
      setNowMinutes(d.getHours() * 60 + d.getMinutes());
    }, 5000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    if (status !== "active" || !soundEnabled || activeAlarm) return;
    if (snoozedUntil && Date.now() < snoozedUntil) return;

    // Only ever consider the ONE block whose time window contains right
    // now -- never scan for older unaccepted blocks. That's what stops
    // the alarm from firing back-to-back through a backlog the moment
    // one gets accepted.
    const current = findCurrentBlock(blocks, nowMinutes);
    if (!current || !current.ring) return;
    if (localStorage.getItem(nowKey(dateISO, current))) return;

    setActiveAlarm(current);
  }, [status, blocks, nowMinutes, soundEnabled, activeAlarm, snoozedUntil, dateISO]);

  function enableSound() {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    audioCtxRef.current.resume();
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    setSoundEnabled(true);
  }

  function acceptAlarm() {
    if (activeAlarm) localStorage.setItem(nowKey(dateISO, activeAlarm), "1");
    setActiveAlarm(null);
    setSnoozedUntil(null);
  }

  function snoozeAlarm() {
    setActiveAlarm(null);
    setSnoozedUntil(Date.now() + 5 * 60 * 1000);
  }

  async function runAction(fn) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await refresh();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const controlProps = {
    nextDayNumber: progress.next_day_number,
    scheduledNextDate: progress.scheduled_next_date,
    lastActiveDate: progress.last_active_date,
    busy,
    onCheckin: () => runAction(checkin),
    onScheduleNext: (date) => runAction(() => scheduleNext(date)),
    onCancelSchedule: () => runAction(cancelSchedule),
    onReset: () => runAction(resetProgram),
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.appTitle}>StudyBell</h1>
            <p style={styles.appSubtitle}>You tell it when a day happens. It never assumes.</p>
          </div>
          {status === "active" && (
            <button
              type="button"
              className="sb-btn"
              style={styles.iconBtn}
              onClick={() => setControlOpen(true)}
              aria-label="Program control"
            >
              <Settings size={19} color="#8fa1c4" />
            </button>
          )}
        </header>

        {error && <p style={styles.errorBanner}>{error}</p>}

        {!soundEnabled && status !== "loading" && (
          <button type="button" className="sb-btn" style={styles.enableBtn} onClick={enableSound}>
            <Volume2 size={16} />
            Turn on alarm sound
          </button>
        )}
        {soundEnabled && status === "active" && (
          <p style={styles.soundOnHint}>
            <BellRing size={13} /> Alarms are armed for today
          </p>
        )}

        {status === "loading" && <p style={styles.muted}>Loading…</p>}

        {status === "sunday" && (
          <div style={styles.sundayCard}>
            <p style={styles.sundayTitle}>Sunday — no sessions today</p>
            <p style={styles.muted}>Rest. Everything resumes tomorrow.</p>
          </div>
        )}

        {(status === "idle" || status === "done") && <ProgramControl {...controlProps} />}

        {status === "active" && (
          <ScheduleList
            dayNumber={dayNumber}
            review={review}
            blocks={blocks}
            nowMinutes={nowMinutes}
          />
        )}
      </div>

      {controlOpen && (
        <div style={styles.modalBackdrop} onClick={() => setControlOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <ProgramControl {...controlProps} onClose={() => setControlOpen(false)} />
          </div>
        </div>
      )}

      <AlarmOverlay
        block={activeAlarm}
        audioCtx={audioCtxRef.current}
        onAccept={acceptAlarm}
        onSnooze={snoozeAlarm}
      />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0e16",
    color: "#eef1f6",
    fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
  },
  container: {
    maxWidth: "560px",
    margin: "0 auto",
    padding: "32px 20px 60px",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "18px",
  },
  appTitle: { margin: 0, fontSize: "23px", fontWeight: 800, letterSpacing: "-0.01em" },
  appSubtitle: { margin: "4px 0 0", fontSize: "13.5px", color: "#8fa1c4" },
  iconBtn: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    border: "1px solid #1e2636",
    background: "#0f1622",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  errorBanner: {
    background: "rgba(226, 96, 96, 0.12)",
    border: "1px solid #4a2626",
    color: "#f0a0a0",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "16px",
  },
  enableBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "20px",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #2c3a56",
    background: "#141d2c",
    color: "#eef1f6",
    fontSize: "14px",
    cursor: "pointer",
  },
  soundOnHint: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12.5px",
    color: "#6fbf73",
    margin: "0 0 16px",
  },
  muted: { color: "#8fa1c4", fontSize: "14px", margin: 0 },
  sundayCard: {
    background: "#0f1622",
    border: "1px solid #1e2636",
    borderRadius: "14px",
    padding: "22px",
  },
  sundayTitle: { margin: "0 0 4px", fontSize: "16px", fontWeight: 700, color: "#eef1f6" },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(6, 9, 15, 0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 900,
  },
};