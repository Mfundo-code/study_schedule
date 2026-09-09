import React, { useEffect, useState } from "react";
import { X, Play, CalendarPlus, RotateCcw, AlertTriangle, Loader2 } from "lucide-react";
import { ensureButtonStyles } from "../buttonStyles";

export default function ProgramControl({
  nextDayNumber,
  scheduledNextDate,
  lastActiveDate,
  onCheckin,
  onScheduleNext,
  onCancelSchedule,
  onReset,
  onClose,
  busy,
}) {
  useEffect(() => {
    ensureButtonStyles();
  }, []);

  const [pickedDate, setPickedDate] = useState("");
  const [confirmingReset, setConfirmingReset] = useState(false);
  const done = nextDayNumber > 15;
  const canSchedule = !busy && !!pickedDate;

  return (
    <div style={styles.wrap}>
      <div style={styles.topRow}>
        <p style={styles.status}>
          {done ? "All 15 days are complete." : `Next up: Day ${nextDayNumber} of 15`}
        </p>
        {onClose && (
          <button
            type="button"
            className="sb-btn"
            style={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} color="#8fa1c4" />
          </button>
        )}
      </div>

      {lastActiveDate && !done && (
        <p style={styles.subtle}>Last active {lastActiveDate}</p>
      )}

      {scheduledNextDate && (
        <div style={styles.scheduledBox}>
          <span>Scheduled to start: {scheduledNextDate}</span>
          <button
            type="button"
            className="sb-btn"
            style={styles.linkBtn}
            onClick={onCancelSchedule}
            disabled={busy}
          >
            Cancel
          </button>
        </div>
      )}

      {!done && (
        <>
          <button
            type="button"
            className="sb-btn"
            style={styles.primaryBtn}
            onClick={onCheckin}
            disabled={busy}
          >
            {busy ? <Loader2 size={16} className="sb-spin" /> : <Play size={16} />}
            {busy ? "Working…" : "I'm working today — start now"}
          </button>

          <div style={styles.scheduleRow}>
            <input
              type="date"
              value={pickedDate}
              onChange={(e) => setPickedDate(e.target.value)}
              style={styles.input}
            />
            <button
              type="button"
              className="sb-btn"
              style={{
                ...styles.secondaryBtn,
                ...(canSchedule ? styles.secondaryBtnActive : {}),
              }}
              disabled={!canSchedule}
              onClick={() => {
                onScheduleNext(pickedDate);
                setPickedDate("");
              }}
            >
              <CalendarPlus size={15} />
              Schedule
            </button>
          </div>
          <p style={styles.hint}>
            {pickedDate
              ? "Pick a date above, then Schedule lights up."
              : "E.g. going away for two days? Pick the date you'll be back — it'll activate itself that day with no further action from you."}
          </p>
        </>
      )}

      <div style={styles.divider} />

      {!confirmingReset ? (
        <button
          type="button"
          className="sb-btn"
          style={styles.resetBtn}
          onClick={() => setConfirmingReset(true)}
          disabled={busy}
        >
          <RotateCcw size={14} />
          {done ? "Start a new 15-day program" : "Restart from Day 1"}
        </button>
      ) : (
        <div style={styles.confirmBox}>
          <p style={styles.confirmText}>
            <AlertTriangle size={15} color="#e0a458" style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>
              This wipes your current progress and activates Day 1 right now.
              Are you sure?
            </span>
          </p>
          <div style={styles.confirmButtons}>
            <button
              type="button"
              className="sb-btn"
              style={styles.cancelBtn}
              onClick={() => setConfirmingReset(false)}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="button"
              className="sb-btn"
              style={styles.confirmResetBtn}
              onClick={() => {
                onReset();
                setConfirmingReset(false);
              }}
              disabled={busy}
            >
              {busy ? "Restarting…" : "Yes, restart"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    background: "#0f1622",
    border: "1px solid #1e2636",
    borderRadius: "14px",
    padding: "20px",
    maxWidth: "420px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  topRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
  },
  status: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 600,
    color: "#eef1f6",
  },
  subtle: {
    margin: "-6px 0 0",
    fontSize: "12.5px",
    color: "#6b7ba0",
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "2px",
    lineHeight: 0,
    flexShrink: 0,
    borderRadius: "6px",
  },
  scheduledBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(201, 161, 92, 0.1)",
    border: "1px solid #3a3120",
    borderRadius: "8px",
    padding: "9px 12px",
    fontSize: "13px",
    color: "#e3c98d",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#e3c98d",
    textDecoration: "underline",
    cursor: "pointer",
    fontSize: "13px",
    padding: 0,
  },
  primaryBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#4f9d69",
    color: "#0b1a10",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
  },
  scheduleRow: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #2c3a56",
    background: "#141d2c",
    color: "#eef1f6",
    fontSize: "14px",
  },
  secondaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #2c3a56",
    background: "#141d2c",
    color: "#5c6b85",
    fontSize: "13px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  secondaryBtnActive: {
    border: "1px solid #c9a15c",
    background: "#241d10",
    color: "#e3c98d",
    boxShadow: "0 0 0 1px rgba(201,161,92,0.25)",
  },
  hint: {
    margin: 0,
    fontSize: "12px",
    lineHeight: 1.5,
    color: "#6b7ba0",
  },
  divider: {
    height: "1px",
    background: "#1e2636",
    margin: "2px 0",
  },
  resetBtn: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid #3a2626",
    background: "transparent",
    color: "#c98a8a",
    fontSize: "12.5px",
    cursor: "pointer",
    alignSelf: "flex-start",
  },
  confirmBox: {
    background: "rgba(224, 96, 96, 0.08)",
    border: "1px solid #4a2626",
    borderRadius: "10px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  confirmText: {
    margin: 0,
    fontSize: "13px",
    color: "#f0c0c0",
    lineHeight: 1.5,
    display: "flex",
    gap: "8px",
  },
  confirmButtons: {
    display: "flex",
    gap: "10px",
  },
  cancelBtn: {
    flex: 1,
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid #2c3a56",
    background: "#141d2c",
    color: "#eef1f6",
    fontSize: "13px",
    cursor: "pointer",
  },
  confirmResetBtn: {
    flex: 1,
    padding: "9px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#c05a5a",
    color: "#2a0d0d",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
  },
};