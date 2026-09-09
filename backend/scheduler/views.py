import json
from datetime import date

from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from .data import DAYS, build_blocks, get_today_status, perform_checkin
from .models import ProgramState


def get_state():
    state = ProgramState.objects.first()
    if not state:
        state = ProgramState.objects.create()
    return state


class ScheduleView(View):
    """Full 15-day template, blocks and all -- read-only reference, not
    used for the daily activation flow."""

    def get(self, request):
        days = [
            {
                "day_number": day["n"],
                "review": day.get("review", False),
                "blocks": build_blocks(day),
            }
            for day in DAYS
        ]
        return JsonResponse({"days": days})


class StateView(View):
    """Raw progress state -- what day is next, was anything scheduled."""

    def get(self, request):
        state = get_state()
        return JsonResponse({
            "next_day_number": state.next_day_number,
            "last_active_date": state.last_active_date.isoformat() if state.last_active_date else None,
            "scheduled_next_date": state.scheduled_next_date.isoformat() if state.scheduled_next_date else None,
        })


class TodayView(View):
    """What does today look like? Auto-activates a pre-scheduled date but
    otherwise never mutates state on its own."""

    def get(self, request):
        state = get_state()
        date_str = request.GET.get("date")
        try:
            today = date.fromisoformat(date_str) if date_str else date.today()
        except ValueError:
            return JsonResponse({"error": "date must be YYYY-MM-DD"}, status=400)

        status = get_today_status(state, today)
        if status["status"] == "ready_to_start":
            status = perform_checkin(state, today)
        return JsonResponse(status)


@method_decorator(csrf_exempt, name="dispatch")
class CheckinView(View):
    """'I'm working today.' Activates today immediately. Idempotent if
    you've already checked in today."""

    def post(self, request):
        state = get_state()
        date_str = _body(request).get("date")
        try:
            today = date.fromisoformat(date_str) if date_str else date.today()
        except ValueError:
            return JsonResponse({"error": "date must be YYYY-MM-DD"}, status=400)
        return JsonResponse(perform_checkin(state, today))


@method_decorator(csrf_exempt, name="dispatch")
class ScheduleNextView(View):
    """'Tomorrow we're on.' Pre-commits a future date; when that date
    arrives, TodayView activates it automatically -- no further action
    needed that day."""

    def post(self, request):
        state = get_state()
        body = _body(request)
        date_str = body.get("date")
        try:
            target = date.fromisoformat(date_str)
        except (TypeError, ValueError):
            return JsonResponse({"error": "date must be YYYY-MM-DD"}, status=400)

        if target < date.today():
            return JsonResponse({"error": "can't schedule a date in the past"}, status=400)
        if target.weekday() == 6:
            return JsonResponse({"error": "Sundays are always rest -- pick another day"}, status=400)
        if state.next_day_number > 15:
            return JsonResponse({"error": "the 15-day program is already complete"}, status=400)

        state.scheduled_next_date = target
        state.save()
        return JsonResponse({"scheduled_next_date": target.isoformat()})


@method_decorator(csrf_exempt, name="dispatch")
class CancelScheduleView(View):
    """Cancel a pending pre-scheduled date without activating it."""

    def post(self, request):
        state = get_state()
        state.scheduled_next_date = None
        state.save()
        return JsonResponse({"scheduled_next_date": None})


@method_decorator(csrf_exempt, name="dispatch")
class ResetView(View):
    """Start the whole 15-day program over -- and immediately activate
    today as Day 1, so the person sees it happen rather than having to
    check in again separately."""

    def post(self, request):
        state = get_state()
        state.next_day_number = 1
        state.last_active_date = None
        state.scheduled_next_date = None
        state.save()

        today = date.today()
        if today.weekday() == 6:  # Sunday -- stay silent, don't auto-activate
            return JsonResponse({"status": "sunday"})
        return JsonResponse(perform_checkin(state, today))


def _body(request):
    try:
        return json.loads(request.body.decode() or "{}")
    except json.JSONDecodeError:
        return {}