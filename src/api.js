const BASE_URL = "http://127.0.0.1:8000/api";

function todayLocalISO() {
  const d = new Date();
  const tzOffsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}

export async function getSettings() {
  const res = await fetch(`${BASE_URL}/settings/`);
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json();
}

export async function postSettings(startDateISO) {
  const res = await fetch(`${BASE_URL}/settings/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ start_date: startDateISO }),
  });
  if (!res.ok) throw new Error("Failed to save start date");
  return res.json();
}

export async function getToday(dateISO) {
  const date = dateISO || todayLocalISO();
  const res = await fetch(`${BASE_URL}/today/?date=${date}`);
  if (!res.ok) throw new Error("Failed to load today's schedule");
  return res.json();
}

export { todayLocalISO };
