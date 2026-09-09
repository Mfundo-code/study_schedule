from django.urls import path

from .views import ScheduleView, SettingsView, TodayView

urlpatterns = [
    path("schedule/", ScheduleView.as_view(), name="schedule"),
    path("settings/", SettingsView.as_view(), name="settings"),
    path("today/", TodayView.as_view(), name="today"),
]
