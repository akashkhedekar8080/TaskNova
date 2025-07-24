from django.db.models.signals import pre_save
from django.dispatch import receiver

from .models import Task


@receiver(pre_save, sender=Task)
def track_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_task = Task.objects.get(pk=instance.pk)
            if old_task.status != instance.status:
                print(
                    f"Task '{instance.title}' status changed from {old_task.status} to {instance.status}"
                )
        except Task.DoesNotExist:
            pass
