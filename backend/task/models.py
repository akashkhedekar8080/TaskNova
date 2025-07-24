import uuid

from django.db import models
from django.utils import timezone
from django.utils.deconstruct import deconstructible
from django.utils.text import slugify


# Create your models here.
class TimeStampModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        abstract = True


@deconstructible
class GenerateEmployeeImagePath:
    def __call__(self, instance, filename):
        ext = filename.split(".")[-1]
        filename = f"{instance.id}.{ext}"
        return f"media/employee/{instance.id}/{filename}"


class Status(models.TextChoices):
    TODO = "todo", "Todo"
    IN_PROGRESS = "in_progress", "In Progress"
    ON_HOLD = "on_hold", "On Hold"
    UNDER_REVIEW = "under_review", "Under Review"
    DONE = "done", "Done"


class Priority(models.TextChoices):
    HIGH = "high", "High"
    LOW = "low", "Low"
    MEDIUM = "medium", "Medium"
    CRITICAL = "critical", "Critical"


class Department(TimeStampModel):
    id = models.UUIDField(
        primary_key=True, unique=True, default=uuid.uuid4, editable=False
    )
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True, null=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        return super().save(*args, **kwargs)

    class Meta:
        ordering = ["name"]


class Employee(TimeStampModel):
    id = models.UUIDField(
        primary_key=True, unique=True, default=uuid.uuid4, editable=False
    )
    department = models.ForeignKey(
        Department, on_delete=models.SET_NULL, null=True, related_name="employees"
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)
    joining_date = models.DateTimeField(default=timezone.now)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    image = models.ImageField(
        upload_to=GenerateEmployeeImagePath(), blank=True, null=True
    )
    is_active = models.BooleanField(default=True)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return self.full_name

    class Meta:
        ordering = ["first_name", "last_name"]
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["department", "is_active"]),
        ]


class TaskManager(models.Manager):
    def by_status(self, status):
        return self.filter(status=status)

    def by_employee(self, employee):
        return self.filter(employee=employee)

    def active_tasks(self):
        return self.exclude(status=Status.DONE)

    def spillover_task(self):
        return self.filter(
            due_date__lt=timezone.now(),
            status__in=[
                Status.TODO,
                Status.IN_PROGRESS,
                Status.ON_HOLD,
                Status.UNDER_REVIEW,
            ],
        )

    def completed_tasks(self):
        return self.filter(status=Status.DONE)

    def by_priority(self, priority):
        return self.filter(priority=priority)


class Task(TimeStampModel):
    id = models.UUIDField(
        primary_key=True, unique=True, default=uuid.uuid4, editable=False
    )
    employee = models.ForeignKey(
        Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name="tasks"
    )
    title = models.CharField(max_length=250)
    slug = models.SlugField(blank=True, null=True, unique=True)
    description = models.TextField()
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.TODO
    )
    priority = models.CharField(
        max_length=20, choices=Priority.choices, default=Priority.MEDIUM
    )
    due_date = models.DateTimeField(null=True, blank=True)
    estimated_sp = models.DecimalField(
        max_digits=5,
        decimal_places=0,
        null=True,
        blank=True,
        help_text="Estimated Story Points",
    )
    actual_sp = models.DecimalField(
        max_digits=5,
        decimal_places=0,
        null=True,
        blank=True,
        help_text="Actual Story Points",
    )
    objects = TaskManager()

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Task.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    @property
    def is_spillover(self):
        if self.due_date and self.status != Status.DONE:
            return timezone.now() > self.due_date
        return False

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["employee", "status"]),
            models.Index(fields=["status", "priority"]),
            models.Index(fields=["due_date"]),
            models.Index(fields=["slug"]),
        ]
