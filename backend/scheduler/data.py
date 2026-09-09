"""
Schedule data and check-in-driven progress logic.

This is the single source of truth for the 15-day rotation. The frontend
never hardcodes subjects or times -- it always asks the API for them.
"""

GRK = "Greek"
OT = "OT Survey"
NT = "NT Survey"
HERM = "Hermeneutics"
CH = "Church History"
PM = "Pastoral Ministry"

DAYS = [
    {"n": 1, "s1": OT, "s2": NT, "app": f"{PM} — assigned readings", "dev": "full"},
    {"n": 2, "s1": HERM, "s2": CH, "app": f"{NT} — assigned readings", "dev": "full"},
    {"n": 3, "s1": PM, "s2": OT, "app": f"{HERM} — written assignment", "dev": "full"},
    {"n": 4, "s1": NT, "s2": HERM, "app": f"{CH} — assigned readings", "dev": "full"},
    {
        "n": 5, "review": True,
        "s1": f"Review — {OT} & {NT} (consolidate Days 1-4)",
        "s2": f"Review — {HERM} & {CH} (consolidate Days 1-4)",
        "app": f"{PM} — catch up on practical work", "dev": "light",
    },
    {"n": 6, "s1": CH, "s2": PM, "app": f"{OT} — assigned readings", "dev": "full"},
    {"n": 7, "s1": OT, "s2": NT, "app": f"{GRK} — extra vocabulary practice", "dev": "full"},
    {"n": 8, "s1": HERM, "s2": CH, "app": f"{PM} — case study work", "dev": "full"},
    {"n": 9, "s1": PM, "s2": OT, "app": f"{NT} — assigned readings", "dev": "full"},
    {
        "n": 10, "review": True,
        "s1": f"Review — {PM} & {OT} (consolidate Days 6-9)",
        "s2": f"Review — {NT} & {HERM} (consolidate Days 6-9)",
        "app": f"{CH} — catch up on readings", "dev": "light",
    },
    {"n": 11, "s1": NT, "s2": HERM, "app": f"{PM} — case study work", "dev": "full"},
    {"n": 12, "s1": CH, "s2": PM, "app": f"{OT} — assigned readings", "dev": "full"},
    {"n": 13, "s1": OT, "s2": NT, "app": f"{HERM} — written assignment", "dev": "full"},
    {"n": 14, "s1": HERM, "s2": CH, "app": f"{PM} — final consolidation", "dev": "full"},
    {
        "n": 15, "review": True,
        "s1": f"Full Review — {OT}, {NT} & {CH}",
        "s2": f"Full Review — {HERM} & {PM}",
        "app": f"{GRK} — final self-test / practice", "dev": "rest",
    },
]


def build_blocks(day):
    """Turn one day's config into the full list of time blocks.

    `ring` marks whether this block should trigger the alarm. Short
    stretch/water breaks don't ring -- everything else does.
    """
    dev = day["dev"]
    dev_label2 = (
        "Software Development — Block 2" if dev == "full"
        else "Software Development — light/admin tasks only" if dev == "light"
        else "Rest — no development work today"
    )
    dev_label3 = (
        "Software Development — light/optional" if dev == "full"
        else "Skip — protect the evening"
    )
    review_label = (
        "Review & consolidate — active recall on today's subjects" if dev != "rest"
        else "Light review — Greek self-test only, keep it short"
    )

    rows = [
        ("03:30", "Wake, wash up, water, prayer/devotion", False),
        ("04:00", f"{GRK} — vocabulary & grammar drill", True),
        ("05:30", "Break — stretch, water", False),
        ("05:45", day["s1"], True),
        ("07:15", "Breakfast (with your wife if your schedules line up)", True),
        ("07:45", "Software Development — Block 1 (deep work)", True),
        ("09:45", "Break", False),
        ("10:00", dev_label2, True),
        ("12:00", "Lunch + short walk outside", True),
        ("13:00", "Power nap (20 min max)", True),
        ("13:20", day["s2"], True),
        ("15:00", "Break — water, stretch", False),
        ("15:15", f"Applied work — {day['app']}", True),
        ("16:45", "Movement / exercise", True),
        ("17:30", "Dinner (with your wife)", True),
        ("18:30", dev_label3, True),
        ("19:15", review_label, True),
        ("19:45", "Time with your wife — protected, no study or work", True),
        ("21:00", "Wind-down — no screens, prepare for bed", True),
        ("21:30", "Sleep (6 hrs to 03:30)", True),
    ]
    return [{"time": t, "title": title, "ring": ring} for t, title, ring in rows]


def get_day(day_number):
    return next(d for d in DAYS if d["n"] == day_number)


def day_payload(day_number):
    day = get_day(day_number)
    return {
        "day_number": day_number,
        "review": day.get("review", False),
        "blocks": build_blocks(day),
    }


def get_today_status(state, today):
    """Read-only: what should today look like, given the current state?

    Does NOT mutate anything -- 'ready_to_start' means the caller should
    call perform_checkin() to actually activate it (auto-fulfilling a
    pre-scheduled date).
    """
    if today.weekday() == 6:  # Sunday
        return {"status": "sunday"}

    if state.last_active_date == today:
        result = {"status": "active"}
        result.update(day_payload(state.next_day_number - 1))
        return result

    if state.scheduled_next_date == today:
        return {"status": "ready_to_start"}

    if state.next_day_number > 15:
        return {"status": "done"}

    return {
        "status": "idle",
        "next_day_number": state.next_day_number,
        "scheduled_next_date": (
            state.scheduled_next_date.isoformat() if state.scheduled_next_date else None
        ),
        "last_active_date": (
            state.last_active_date.isoformat() if state.last_active_date else None
        ),
    }


def perform_checkin(state, today):
    """Mutating: activate today. Idempotent if already active today.
    Advances next_day_number and clears any pending schedule."""
    if today.weekday() == 6:
        return {"status": "sunday"}

    if state.last_active_date == today:
        result = {"status": "active"}
        result.update(day_payload(state.next_day_number - 1))
        return result

    if state.next_day_number > 15:
        return {"status": "done"}

    day_number = state.next_day_number
    state.next_day_number += 1
    state.last_active_date = today
    state.scheduled_next_date = None
    state.save()

    result = {"status": "active"}
    result.update(day_payload(day_number))
    return result
