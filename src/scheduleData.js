// The 15-Day Focus Schedule.
// The day starts at 05:30, every subject gets a 2-hour block, and bed is 22:30.
// Times are computed from the durations below, so to change the start
// time or resize a block you only edit START or a number of minutes.

const START = "05:30";

const pad = (n) => String(n).padStart(2, "0");
const toMin = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const toHM = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

// items: [durationInMinutes, title]. The final item has no duration (Sleep).
function layout(items) {
  let t = toMin(START);
  return items.map(([dur, title]) => {
    const time = toHM(t);
    if (dur == null) return { time, end: null, title, ring: true };
    t += dur;
    return { time, end: toHM(t), title, ring: true };
  });
}

function buildDay(d) {
  const first = d.n === 1;
  const second = d.n === 2;
  const early = first || second;

  return layout([
    [30, first ? "Wake, wash up, water, prayer & devotion" : "Wake, wash up, water, prayer/devotion"],
    [120, first ? "Greek: grammar" : "Greek: vocabulary & grammar drill"],
    [30, first ? "Breakfast and tea" : second ? "Breakfast" : "Breakfast (with my wife if your schedules line up)"],
    [120, d.a],
    [10, "Break: stretch, water"],
    [120, d.n === 15 ? "Rest: no ministry or development work today" : "Pastoral Ministry: sermon & Bible study preparation"],
    [
      40,
      first
        ? "Lunch + short walk outside or garden making, cleaning or any house work"
        : second
        ? "Lunch and short walk outside, house work"
        : "Lunch + short walk outside",
    ],
    [120, first ? "Software Development projects" : "Software Development"],
    [10, "Break: water, stretch"],
    [120, d.b],
    [10, "Break"],
    [120, d.c],
    [30, first ? "Movement / house duties" : "Movement / exercise"],
    [40, early ? "Dinner" : "Dinner (with my wife)"],
    [30, "Help my wife with house chores there and there"],
    [45, "Time with my wife: protected, no study or work"],
    [25, "Wind-down, prayer, no screens, prepare for bed"],
    [null, `Sleep (7 hrs to ${START})`],
  ]);
}

const DAYS = [
  { n: 1, a: "OT Survey", b: "NT Survey", c: "Pastoral Theology" },
  { n: 2, a: "Hermeneutics", b: "Church History", c: "Applied work (NT Survey): assigned readings" },
  { n: 3, a: "Pastoral Theology", b: "OT Survey", c: "Applied work (Hermeneutics): written assignment" },
  { n: 4, a: "NT Survey", b: "Hermeneutics", c: "Applied work (Church History): assigned readings" },
  {
    n: 5,
    a: "Review: OT Survey & NT Survey (consolidate Days 1 to 4)",
    b: "Review: Hermeneutics & Church History (consolidate Days 1 to 4)",
    c: "Applied work (Pastoral Theology): catch up on practical work",
  },
  { n: 6, a: "Church History", b: "Pastoral Theology", c: "Applied work (OT Survey): assigned readings" },
  { n: 7, a: "OT Survey", b: "NT Survey", c: "Applied work (Greek): extra vocabulary practice" },
  { n: 8, a: "Hermeneutics", b: "Church History", c: "Applied work (Pastoral Theology): case study work" },
  { n: 9, a: "Pastoral Theology", b: "OT Survey", c: "Applied work (NT Survey): assigned readings" },
  {
    n: 10,
    a: "Review: Pastoral Theology & OT Survey (consolidate Days 6 to 9)",
    b: "Review: NT Survey & Hermeneutics (consolidate Days 6 to 9)",
    c: "Applied work (Church History): catch up on readings",
  },
  { n: 11, a: "NT Survey", b: "Hermeneutics", c: "Applied work (Pastoral Theology): case study work" },
  { n: 12, a: "Church History", b: "Pastoral Theology", c: "Applied work (OT Survey): assigned readings" },
  { n: 13, a: "OT Survey", b: "NT Survey", c: "Applied work (Hermeneutics): written assignment" },
  { n: 14, a: "Hermeneutics", b: "Church History", c: "Applied work (Pastoral Theology): final consolidation" },
  {
    n: 15,
    a: "Full Review: OT Survey, NT Survey & Church History",
    b: "Full Review: Hermeneutics & Pastoral Theology",
    c: "Applied work (Greek): final self-test / practice",
  },
];

const SCHEDULE = {};
DAYS.forEach((d) => {
  SCHEDULE[d.n] = buildDay(d);
});

export default SCHEDULE;