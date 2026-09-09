import React from "react";
import { CheckCircle2 } from "lucide-react";
import { categorize } from "../categorize";

export default function BlockRow({ block, state }) {
  // state: "past" | "current" | "upcoming"
  const { color, bg, Icon } = categorize(block.title);

  const rowStyle = {
    ...styles.row,
    borderLeft: `3px solid ${state === "past" ? "#1e2636" : color}`,
    background: state === "current" ? bg : "transparent",
    opacity: state === "past" ? 0.45 : 1,
  };

  return (
    <div style={rowStyle}>
      <div style={{ ...styles.iconWrap, background: state === "past" ? "#161d2b" : bg }}>
        {state === "past" ? (
          <CheckCircle2 size={16} color="#4a5570" />
        ) : (
          <Icon size={16} color={color} />
        )}
      </div>
      <span style={styles.time}>{block.time}</span>
      <span style={styles.title}>{block.title}</span>
      {state === "current" && (
        <span style={{ ...styles.badge, background: color }}>now</span>
      )}
    </div>
  );
}

const styles = {
  row: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "11px 14px",
    borderBottom: "1px solid #161d2b",
    transition: "background 0.2s ease",
  },
  iconWrap: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  time: {
    width: "50px",
    flexShrink: 0,
    fontSize: "12.5px",
    color: "#8fa1c4",
    fontVariantNumeric: "tabular-nums",
  },
  title: {
    flex: 1,
    fontSize: "14px",
    color: "#eef1f6",
    lineHeight: 1.4,
  },
  badge: {
    fontSize: "10.5px",
    padding: "3px 9px",
    borderRadius: "999px",
    color: "#0b1220",
    fontWeight: 700,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    flexShrink: 0,
  },
};
