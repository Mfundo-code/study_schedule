// Shared time-window logic used by both the alarm trigger (App.js) and
// the schedule display (ScheduleList.js), so they always agree on what
// "current" means and never drift apart.

export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// Returns the single block whose time window [start, nextStart) contains
// nowMinutes -- or null if none does (e.g. before 03:30). Only ever one
// block can be "current" at a time; this is deliberate -- it's what stops
// the alarm from firing for a backlog of missed earlier blocks the moment
// one gets accepted.
export function findCurrentBlock(blocks, nowMinutes) {
  for (let i = 0; i < blocks.length; i++) {
    const start = toMinutes(blocks[i].time);
    const end = i + 1 < blocks.length ? toMinutes(blocks[i + 1].time) : 24 * 60;
    if (nowMinutes >= start && nowMinutes < end) {
      return blocks[i];
    }
  }
  return null;
}