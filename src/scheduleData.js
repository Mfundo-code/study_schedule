// The 15-Day Focus Schedule, copied from Schedule.docx.
// Every day has the same shape; only a few rows change from day to day.

const row = (time, end, title) => ({ time, end, title, ring: true });

function buildDay(d) {
  const first = d.n === 1;
  const second = d.n === 2;
  const rows = [
    row("03:30", "04:00", first ? "Wake, wash up, water, prayer & devotion" : "Wake, wash up, water, prayer/devotion"),
    row("04:00", "05:30", first ? "Greek: grammar" : "Greek: vocabulary & grammar drill"),
    row("05:30", "05:45", "Break: stretch, water"),
    row("05:45", "07:15", d.a),
    row("07:15", "07:45", first ? "Break and tea/ breakfast" : second ? "Breakfast" : "Breakfast (with my wife if your schedules line up)"),
    row("07:45", "09:45", first ? "Software Development projects" : "Software Development"),
    row("09:45", "10:00", "Break"),
    row("10:00", "12:00", d.n === 15 ? "Rest: no ministry or development work today" : "Pastoral Ministry: sermon & Bible study preparation"),
    row(
      "12:00",
      "13:00",
      first
        ? "Lunch + short walk outside or garden making, cleaning or any house work"
        : second
        ? "Lunch and short walk outside, house work"
        : "Lunch + short walk outside"
    ),
  ];

  if (first) {
    rows.push(row("13:00", "13:30", "Continue with house work if not done (20 min max)"));
    rows.push(row("13:30", "15:00", d.b));
  } else if (second) {
    rows.push(row("13:00", "13:30", "Continue with house work"));
    // The doc says 13:20 here, which overlaps the row above. 13:30 is used so the rows don't overlap.
    rows.push(row("13:30", "15:00", d.b));
  } else {
    rows.push(row("13:00", "13:20", "Power nap (20 min max)"));
    rows.push(row("13:20", "15:00", d.b));
  }

  rows.push(
    row("15:00", "15:15", "Break: water, stretch"),
    row("15:15", "16:45", d.c),
    row("16:45", "17:30", first ? "Movement / house duties" : "Movement / exercise"),
    row("17:30", "18:30", first || second ? "Dinner" : "Dinner (with my wife)"),
    row("18:30", "19:15", "Help my wife with house chores there and there"),
    row("19:15", "19:45", "Greek paradigms and vocab"),
    row("19:45", "21:00", "Time with my wife: protected, no study or work"),
    row("21:00", "21:30", "Wind-down, prayer, no screens, prepare for bed"),
    { time: "21:30", end: null, title: "Sleep (6 hrs to 03:30)", ring: true }
  );
  return rows;
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