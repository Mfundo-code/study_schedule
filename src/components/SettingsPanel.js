import React, { useState } from "react";
import { todayLocalISO } from "../api";

export default function SettingsPanel({ onSave, existingStartDate }) {
  const [value, setValue] = useState(existingStartDate || todayLocalISO());
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!value) {
      setError("Pick a date first.");
      return;
    }
    setError("");
    onSave(value);
  }

  return (
    <div style={styles.wrap}>
      <h2 style={styles.title}>
        {existingStartDate ? "Change your start date" : "Set your Day 1"}
      </h2>
      <p style={styles.body}>
        Pick the date your 15-day focus block begins. Sundays are always
        rest — anything due on a Sunday quietly moves to the next day.
      </p>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          {existingStartDate ? "Restart program" : "Start program"}
        </button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  wrap: {
    background: "#0f1622",
    border: "1px solid #1e2636",
    borderRadius: "14px",
    padding: "24px",
    maxWidth: "420px",
  },
  title: {
    margin: "0 0 8px",
    fontSize: "18px",
    fontWeight: 600,
    color: "#eef1f6",
  },
  body: {
    margin: "0 0 18px",
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#8fa1c4",
  },
  form: {
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
  button: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#c9a15c",
    color: "#241a08",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
  },
  error: {
    marginTop: "10px",
    fontSize: "13px",
    color: "#e26060",
  },
};
