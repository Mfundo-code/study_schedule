// Shared time-window logic used by the alarm trigger (App.js), the
// schedule display (ScheduleList.js) and the timer (TimerOverlay.js), so
// they always agree on what "current" means.

export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// Index of the single block whose window [start, nextStart) contains
// nowMinutes, or -1 if none does (e.g. before 03:30).
export function findCurrentIndex(blocks, nowMinutes) {
  for (let i = 0; i < blocks.length; i++) {
    const start = toMinutes(blocks[i].time);
    const end = i + 1 < blocks.length ? toMinutes(blocks[i + 1].time) : 24 * 60;
    if (nowMinutes >= start && nowMinutes < end) return i;
  }
  return -1;
}

export function findCurrentBlock(blocks, nowMinutes) {
  const i = findCurrentIndex(blocks, nowMinutes);
  return i === -1 ? null : blocks[i];
}