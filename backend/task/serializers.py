from rest_framework import serializers

from .models import Department, Employee, Task


class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = [
            "id",
            "slug",
            "name",
            "description",
            "is_active",
            "created_at",
            "updated_at",
            "employee_count",
        ]

    def get_employee_count(self, obj):
        return obj.employees.filter(is_active=True).count()


class EmployeeSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.UUIDField(write_only=True, required=False)
    active_task_count = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            "id",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "image",
            "phone",
            "designation",
            "joining_date",
            "department",
            "department_id",
            "active_task_count",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        department_id = validated_data.pop("department_id", None)
        task = Employee.objects.create(**validated_data)
        if department_id:
            try:
                department = Department.objects.get(id=department_id)
                task.department = department
                task.save()
            except Department.DoesNotExist:
                raise serializers.ValidationError("Department not found")
        return task

    def update(self, instance, validated_data):
        department_id = validated_data.pop("department_id", None)
        if department_id:
            try:
                department = Department.objects.get(id=department_id)
                instance.department = department
            except Department.DoesNotExist:
                raise serializers.ValidationError("Department not found")

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def get_active_task_count(self, obj):
        return obj.tasks.filter(status="in_progress").count()


class TaskSerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer(read_only=True)  # ADD read_only=True
    employee_id = serializers.UUIDField(
        write_only=True, required=False
    )  # ADD THIS LINE
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    department_name = serializers.CharField(
        source="employee.department.name", read_only=True
    )

    class Meta:
        model = Task
        fields = [
            "id",
            "slug",
            "title",
            "description",
            "status",
            "priority",
            "due_date",
            "is_spillover",
            "estimated_sp",
            "actual_sp",
            "created_at",
            "updated_at",
            "employee",
            "employee_id",  # ADD THIS LINE
            "employee_name",
            "department_name",
        ]

    def create(self, validated_data):
        employee_id = validated_data.pop("employee_id", None)
        task = Task.objects.create(**validated_data)
        if employee_id:
            try:
                employee = Employee.objects.get(id=employee_id)
                task.employee = employee
                task.save()
            except Employee.DoesNotExist:
                raise serializers.ValidationError("Employee not found")
        return task

    def update(self, instance, validated_data):
        employee_id = validated_data.pop("employee_id", None)
        if employee_id:
            try:
                employee = Employee.objects.get(id=employee_id)
                instance.employee = employee
            except Employee.DoesNotExist:
                raise serializers.ValidationError("Employee not found")

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
