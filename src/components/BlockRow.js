import React from "react";

export default function BlockRow({ block, state }) {
  // state: "past" | "current" | "upcoming"
  const rowStyle = {
    ...styles.row,
    ...(state === "current" ? styles.rowCurrent : {}),
    ...(state === "past" ? styles.rowPast : {}),
  };

  return (
    <div style={rowStyle}>
      <span style={styles.time}>{block.time}</span>
      <span style={styles.title}>{block.title}</span>
      {state === "current" && <span style={styles.badge}>now</span>}
    </div>
  );
}

const styles = {
  row: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "10px 14px",
    borderBottom: "1px solid #1e2636",
  },
  rowCurrent: {
    background: "rgba(201, 161, 92, 0.12)",
    borderRadius: "8px",
  },
  rowPast: {
    opacity: 0.4,
  },
  time: {
    width: "56px",
    flexShrink: 0,
    fontSize: "13px",
    color: "#8fa1c4",
    fontVariantNumeric: "tabular-nums",
  },
  title: {
    flex: 1,
    fontSize: "14px",
    color: "#eef1f6",
  },
  badge: {
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "999px",
    background: "#c9a15c",
    color: "#241a08",
    fontWeight: 600,
  },
};
