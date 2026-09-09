import json
from datetime import date

from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from .data import DAYS, build_blocks, resolve_day, get_day
from .models import ProgramSettings


class ScheduleView(View):
    """Full 15-day template, blocks and all. Used to render a read-only
    overview if the frontend ever wants one -- the daily alarm flow uses
    TodayView instead."""

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


@method_decorator(csrf_exempt, name="dispatch")
class SettingsView(View):
    """GET the current start date, POST a new one to (re)start the program."""

    def get(self, request):
        settings_obj = ProgramSettings.objects.first()
        if not settings_obj:
            return JsonResponse({"start_date": None})
        return JsonResponse({"start_date": settings_obj.start_date.isoformat()})

    def post(self, request):
        try:
            body = json.loads(request.body.decode() or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "invalid JSON body"}, status=400)

        start_date_str = body.get("start_date")
        try:
            start_date = date.fromisoformat(start_date_str)
        except (TypeError, ValueError):
            return JsonResponse(
                {"error": "start_date must be YYYY-MM-DD"}, status=400
            )

        settings_obj = ProgramSettings.objects.create(start_date=start_date)
        return JsonResponse({"start_date": settings_obj.start_date.isoformat()})


class TodayView(View):
    """What day is it in the program, and what are today's blocks (if any)?

    Query param: ?date=YYYY-MM-DD (defaults to server's today; pass the
    client's local date for accuracy).
    """

    def get(self, request):
        settings_obj = ProgramSettings.objects.first()
        if not settings_obj:
            return JsonResponse({"status": "not_configured"})

        date_str = request.GET.get("date")
        try:
            target = date.fromisoformat(date_str) if date_str else date.today()
        except ValueError:
            return JsonResponse({"error": "date must be YYYY-MM-DD"}, status=400)

        result = resolve_day(settings_obj.start_date, target)

        if result["status"] == "day":
            day = get_day(result["day_number"])
            result["blocks"] = build_blocks(day)
            result["review"] = day.get("review", False)

        result["date"] = target.isoformat()
        result["start_date"] = settings_obj.start_date.isoformat()
        return JsonResponse(result)
