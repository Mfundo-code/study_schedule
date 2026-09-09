import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import BlockRow from "./BlockRow";
import { categorize } from "../categorize";
import { toMinutes, findCurrentBlock } from "../scheduleTime";

export default function ScheduleList({ dayNumber, review, blocks, nowMinutes }) {
  const [expanded, setExpanded] = useState(false);
  const current = findCurrentBlock(blocks, nowMinutes);
  const currentCat = current ? categorize(current.title) : null;

  return (
    <div style={styles.wrap}>
      <button
        type="button"
        style={styles.header}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div style={styles.headerLeft}>
          <h2 style={styles.dayLabel}>
            Day {dayNumber}
            {review && <span style={styles.reviewTag}>Review &amp; Recovery</span>}
          </h2>
          <p style={styles.progressText}>Day {dayNumber} of 15</p>
          <div style={styles.progressBar}>
            {Array.from({ length: 15 }, (_, i) => (
              <div
                key={i}
                style={{
                  ...styles.progressDot,
                  background:
                    i + 1 < dayNumber ? "#4f9d69" : i + 1 === dayNumber ? "#c9a15c" : "#1e2636",
                }}
              />
            ))}
          </div>
          {current && (
            <p style={{ ...styles.nowLine, color: currentCat.color }}>
              Now: {current.title} ({current.time})
            </p>
          )}
        </div>
        <div style={styles.toggleWrap}>
          <span style={styles.toggleLabel}>{expanded ? "Hide" : "View"} schedule</span>
          {expanded ? <ChevronUp size={18} color="#8fa1c4" /> : <ChevronDown size={18} color="#8fa1c4" />}
        </div>
      </button>

      {expanded && (
        <div style={styles.list}>
          {blocks.map((block, i) => {
            const blockMinutes = toMinutes(block.time);
            const nextMinutes = i + 1 < blocks.length ? toMinutes(blocks[i + 1].time) : 24 * 60;
            let state = "upcoming";
            if (nowMinutes >= nextMinutes) state = "past";
            else if (nowMinutes >= blockMinutes) state = "current";
            return <BlockRow key={block.time + block.title} block={block} state={state} />;
          })}
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
    overflow: "hidden",
  },
  header: {
    width: "100%",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    padding: "18px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },
  dayLabel: {
    margin: 0,
    fontSize: "19px",
    fontWeight: 700,
    color: "#eef1f6",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  reviewTag: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.03em",
    textTransform: "uppercase",
    color: "#241a08",
    background: "#c9a15c",
    padding: "3px 9px",
    borderRadius: "999px",
  },
  progressText: {
    margin: 0,
    fontSize: "12.5px",
    color: "#8fa1c4",
  },
  progressBar: {
    display: "flex",
    gap: "4px",
    maxWidth: "260px",
  },
  progressDot: {
    flex: 1,
    height: "5px",
    borderRadius: "999px",
  },
  nowLine: {
    margin: "2px 0 0",
    fontSize: "13px",
    fontWeight: 600,
  },
  toggleWrap: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexShrink: 0,
    paddingTop: "2px",
  },
  toggleLabel: {
    fontSize: "12.5px",
    color: "#8fa1c4",
    whiteSpace: "nowrap",
  },
  list: {
    padding: "4px",
    borderTop: "1px solid #1e2636",
  },
};