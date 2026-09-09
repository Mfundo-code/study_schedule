import React from "react";
import BlockRow from "./BlockRow";

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export default function ScheduleList({ dayNumber, review, blocks, nowMinutes }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h2 style={styles.dayLabel}>
          Day {dayNumber}
          {review ? " — Review & Recovery" : ""}
        </h2>
      </div>
      <div style={styles.list}>
        {blocks.map((block, i) => {
          const blockMinutes = toMinutes(block.time);
          const nextMinutes =
            i + 1 < blocks.length ? toMinutes(blocks[i + 1].time) : 24 * 60;
          let state = "upcoming";
          if (nowMinutes >= nextMinutes) state = "past";
          else if (nowMinutes >= blockMinutes) state = "current";
          return <BlockRow key={block.time + block.title} block={block} state={state} />;
        })}
      </div>
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
    padding: "16px 18px",
    borderBottom: "1px solid #1e2636",
  },
  dayLabel: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 600,
    color: "#eef1f6",
  },
  list: {
    padding: "6px 4px",
  },
};
