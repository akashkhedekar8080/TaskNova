from django.contrib import admin

from .models import Department, Employee, Task


# Register your models here.
class StatusFilter(admin.SimpleListFilter):
    title = "Status"
    parameter_name = "status"

    def lookups(self, request, model_admin):
        return [
            ("todo", "Todo"),
            ("in_progress", "In Progress"),
            ("on_hold", "On Hold"),
            ("under_review", "Under Review"),
            ("done", "Done"),
        ]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(status=self.value())
        return queryset


class PriorityFilter(admin.SimpleListFilter):
    title = "Priority"
    parameter_name = "priority"

    def lookups(self, request, model_admin):
        return [
            ("high", "High"),
            ("low", "Low"),
            ("medium", "Medium"),
            ("critical", "Critical"),
        ]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(priority=self.value())
        return queryset


class TaskInline(admin.TabularInline):
    model = Task
    fields = (
        "title",
        "description",
        "status",
        "priority",
        "due_date",
        "estimated_sp",
        "actual_sp",
    )
    readonly_fields = ("id",)
    extra = 0


class EmployeeInline(admin.TabularInline):
    model = Employee
    fields = ("first_name", "last_name", "email", "designation", "is_active")
    readonly_fields = ("id",)
    extra = 0


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "description", "is_active", "created_at", "employee_count")
    list_filter = ("is_active", "created_at")
    search_fields = ("name", "description")
    inlines = (EmployeeInline,)
    prepopulated_fields = {"slug": ("name",)}

    def employee_count(self, obj):
        return obj.employees.filter(is_active=True).count()

    employee_count.short_description = "Total Employees"


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "email",
        "department",
        "phone",
        "designation",
        "joining_date",
        "is_active",
        "active_task_count",
    )
    inlines = (TaskInline,)
    list_filter = (
        "department",
        "is_active",
        "joining_date",
        "designation",
        "created_at",
    )
    search_fields = (
        "first_name",
        "last_name",
        "email",
        "designation",
        "department__name",
    )

    def active_task_count(self, obj):
        return obj.tasks.filter(status="in_progress").count()

    active_task_count.short_description = "Active Tasks"


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "employee",
        "description",
        "status",
        "priority",
        "due_date",
        "created_at",
        "estimated_sp",
        "actual_sp",
        "is_spillover",
    )
    prepopulated_fields = {"slug": ("title",)}
    list_filter = (
        "status",
        "priority",
        "employee__department",
        "due_date",
        "created_at",
        StatusFilter,
        PriorityFilter,
    )
    search_fields = (
        "title",
        "description",
        "employee__first_name",
        "employee__last_name",
        "employee__email",
    )


admin.site.site_header = "Tasknova Administration"
admin.site.site_title = "Tasknova"
admin.site.index_title = "Welcome to Tasknova"
