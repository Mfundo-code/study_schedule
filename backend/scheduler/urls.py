from django.urls import path

from .views import (
    CancelScheduleView,
    CheckinView,
    ResetView,
    ScheduleNextView,
    ScheduleView,
    StateView,
    TodayView,
)

urlpatterns = [
    path("schedule/", ScheduleView.as_view(), name="schedule"),
    path("state/", StateView.as_view(), name="state"),
    path("today/", TodayView.as_view(), name="today"),
    path("checkin/", CheckinView.as_view(), name="checkin"),
    path("schedule-next/", ScheduleNextView.as_view(), name="schedule-next"),
    path("cancel-schedule/", CancelScheduleView.as_view(), name="cancel-schedule"),
    path("reset/", ResetView.as_view(), name="reset"),
]
