from django.db import models


class ProgramState(models.Model):
    """Tracks progress through the 15 days by check-in, not by calendar date.

    next_day_number: which day gets assigned the next time a check-in happens.
    last_active_date: the date most recently checked in as active (today's
        check-in is idempotent if this already equals today).
    scheduled_next_date: an optional future date pre-committed as "the next
        active day" -- when that date arrives, it auto-activates with no
        further action needed.
    """

    next_day_number = models.IntegerField(default=1)
    last_active_date = models.DateField(null=True, blank=True)
    scheduled_next_date = models.DateField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Next day: {self.next_day_number}, last active: {self.last_active_date}"
