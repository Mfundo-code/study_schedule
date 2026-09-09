from django.db import models


class ProgramSettings(models.Model):
    """Single-row-ish settings table. The most recently created row wins,
    so restarting the program (picking a new start date) is just a new row."""

    start_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Program starting {self.start_date}"
