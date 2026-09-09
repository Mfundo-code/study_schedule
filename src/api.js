const BASE_URL = "/api";

function todayLocalISO() {
  const d = new Date();
  const tzOffsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function getToday() {
  return handle(await fetch(`${BASE_URL}/today/?date=${todayLocalISO()}`));
}

export async function getState() {
  return handle(await fetch(`${BASE_URL}/state/`));
}

export async function checkin() {
  return handle(
    await fetch(`${BASE_URL}/checkin/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: todayLocalISO() }),
    })
  );
}

export async function scheduleNext(dateISO) {
  return handle(
    await fetch(`${BASE_URL}/schedule-next/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateISO }),
    })
  );
}

export async function cancelSchedule() {
  return handle(await fetch(`${BASE_URL}/cancel-schedule/`, { method: "POST" }));
}

export async function resetProgram() {
  return handle(await fetch(`${BASE_URL}/reset/`, { method: "POST" }));
}

export { todayLocalISO };
