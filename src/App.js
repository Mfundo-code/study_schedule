import React, { useCallback, useEffect, useRef, useState } from "react";
import { getSettings, postSettings, getToday } from "./api";
import SettingsPanel from "./components/SettingsPanel";
import ScheduleList from "./components/ScheduleList";
import AlarmOverlay from "./components/AlarmOverlay";

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function nowKey(dateISO, block) {
  return `studybell:${dateISO}:${block.time}:${block.title}`;
}

export default function App() {
  const [status, setStatus] = useState("loading"); // loading | not_configured | before | sunday | day | done
  const [dayNumber, setDayNumber] = useState(null);
  const [review, setReview] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [dateISO, setDateISO] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [nowMinutes, setNowMinutes] = useState(0);
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [snoozedUntil, setSnoozedUntil] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [error, setError] = useState("");
  const audioCtxRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getToday();
      setStatus(data.status);
      setDateISO(data.date);
      setStartDate(data.start_date || null);
      if (data.status === "day") {
        setDayNumber(data.day_number);
        setReview(!!data.review);
        setBlocks(data.blocks);
      }
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

  // Decide whether a block is due right now and hasn't been accepted yet.
  useEffect(() => {
    if (status !== "day" || !soundEnabled || activeAlarm) return;
    if (snoozedUntil && Date.now() < snoozedUntil) return;

    const due = blocks.find((b) => {
      if (!b.ring) return false;
      if (nowMinutes < toMinutes(b.time)) return false;
      const key = nowKey(dateISO, b);
      return !localStorage.getItem(key);
    });

    if (due) setActiveAlarm(due);
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
    if (activeAlarm) {
      localStorage.setItem(nowKey(dateISO, activeAlarm), "1");
    }
    setActiveAlarm(null);
    setSnoozedUntil(null);
  }

  function snoozeAlarm() {
    setActiveAlarm(null);
    setSnoozedUntil(Date.now() + 5 * 60 * 1000);
  }

  async function handleSaveStartDate(startDateISO) {
    await postSettings(startDateISO);
    await refresh();
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.appTitle}>StudyBell</h1>
          <p style={styles.appSubtitle}>Rings until you accept. Stays quiet on Sundays.</p>
        </header>

        {error && <p style={styles.errorBanner}>{error}</p>}

        {!soundEnabled && status !== "loading" && (
          <button type="button" style={styles.enableBtn} onClick={enableSound}>
            Turn on alarm sound
          </button>
        )}

        {status === "loading" && <p style={styles.muted}>Loading…</p>}

        {status === "not_configured" && (
          <SettingsPanel onSave={handleSaveStartDate} existingStartDate={null} />
        )}

        {status === "before" && (
          <p style={styles.muted}>Your program starts on {startDate}. Come back then.</p>
        )}

        {status === "sunday" && (
          <p style={styles.muted}>It's Sunday — no sessions today. Rest.</p>
        )}

        {status === "done" && (
          <div style={styles.doneWrap}>
            <p style={styles.muted}>You've completed all 15 days.</p>
            <SettingsPanel onSave={handleSaveStartDate} existingStartDate={startDate} />
          </div>
        )}

        {status === "day" && (
          <>
            <ScheduleList
              dayNumber={dayNumber}
              review={review}
              blocks={blocks}
              nowMinutes={nowMinutes}
            />
            <details style={styles.settingsDetails}>
              <summary style={styles.settingsSummary}>Change start date</summary>
              <div style={{ marginTop: "12px" }}>
                <SettingsPanel onSave={handleSaveStartDate} existingStartDate={startDate} />
              </div>
            </details>
          </>
        )}
      </div>

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
    marginBottom: "20px",
  },
  appTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
  },
  appSubtitle: {
    margin: "4px 0 0",
    fontSize: "14px",
    color: "#8fa1c4",
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
    marginBottom: "20px",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #2c3a56",
    background: "#141d2c",
    color: "#eef1f6",
    fontSize: "14px",
    cursor: "pointer",
  },
  muted: {
    color: "#8fa1c4",
    fontSize: "14px",
  },
  doneWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  settingsDetails: {
    marginTop: "16px",
    fontSize: "13px",
    color: "#8fa1c4",
  },
  settingsSummary: {
    cursor: "pointer",
  },
};
