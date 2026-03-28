from django.db import models

class Report(models.Model):
    owner_id = models.CharField(max_length=100)
    lat = models.FloatField()
    lng = models.FloatField()
    title = models.CharField(max_length=200)
    desc = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    trust_score = models.IntegerField(default=70)

    def __str__(self):
        return f"{self.title} ({self.owner_id})"