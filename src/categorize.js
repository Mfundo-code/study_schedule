import {
  Sunrise,
  BookOpen,
  Coffee,
  Utensils,
  Code2,
  Moon,
  Heart,
  Activity,
  RotateCcw,
  PenSquare,
} from "lucide-react";

const CATEGORIES = {
  wake: { color: "#8b7fd6", bg: "rgba(139,127,214,0.12)", Icon: Sunrise },
  study: { color: "#5b8fdb", bg: "rgba(91,143,219,0.12)", Icon: BookOpen },
  break: { color: "#5c6b85", bg: "rgba(92,107,133,0.10)", Icon: Coffee },
  meal: { color: "#e0a458", bg: "rgba(224,164,88,0.12)", Icon: Utensils },
  dev: { color: "#4fb8a6", bg: "rgba(79,184,166,0.12)", Icon: Code2 },
  applied: { color: "#c9a15c", bg: "rgba(201,161,92,0.12)", Icon: PenSquare },
  movement: { color: "#6fbf73", bg: "rgba(111,191,115,0.12)", Icon: Activity },
  wife: { color: "#e08bab", bg: "rgba(224,139,171,0.14)", Icon: Heart },
  review: { color: "#c9a15c", bg: "rgba(201,161,92,0.12)", Icon: RotateCcw },
  sleep: { color: "#8b7fd6", bg: "rgba(139,127,214,0.12)", Icon: Moon },
};

export function categorize(title) {
  const t = title.toLowerCase();
  if (t.startsWith("wake")) return CATEGORIES.wake;
  if (t.startsWith("break")) return CATEGORIES.break;
  if (t.includes("breakfast") || t.includes("lunch") || t.includes("dinner")) return CATEGORIES.meal;
  if (t.includes("software development")) return CATEGORIES.dev;
  if (t.startsWith("applied work")) return CATEGORIES.applied;
  if (t.includes("movement") || t.includes("exercise")) return CATEGORIES.movement;
  if (t.includes("your wife")) return CATEGORIES.wife;
  if (t.startsWith("review") || t.includes("review &")) return CATEGORIES.review;
  if (t.includes("wind-down") || t.startsWith("sleep")) return CATEGORIES.sleep;
  if (t.startsWith("power nap")) return CATEGORIES.sleep;
  return CATEGORIES.study; // Greek, OT/NT/Hermeneutics/Church History/Pastoral Ministry, review blocks
}
