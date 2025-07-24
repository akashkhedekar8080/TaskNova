from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import Department, Employee, Status, Task
from .serializers import DepartmentSerializer, EmployeeSerializer, TaskSerializer


class DepartmentModelViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]


class EmployeeModelViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]


class TaskModelViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Task.objects.all()
        else:
            try:
                employee = Employee.objects.get(email=user.email)
                return Task.objects.filter(employee=employee)
            except Employee.DoesNotExist:
                return Task.objects.none()

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            permission_classes = [IsAuthenticated]
        elif self.action in ["partial_update"] and self.is_status_only_update():
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

    def is_status_only_update(self):
        if hasattr(self.request, "data"):
            allowed_fields = ["status"]
            return all(key in allowed_fields for key in self.request.data.keys())
        return False

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not (request.user.is_staff or request.user.is_superuser):
            allowed_fields = ["status"]
            if not all(key in allowed_fields for key in request.data.keys()):
                return Response(
                    {"error": "You can only update task status"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            try:
                employee = Employee.objects.get(email=request.user.email)
                if instance.employee != employee:
                    return Response(
                        {"error": "You can only update your own tasks"},
                        status=status.HTTP_403_FORBIDDEN,
                    )
            except Employee.DoesNotExist:
                return Response(
                    {"error": "Employee profile not found"},
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get("status")
        if new_status not in [choice[0] for choice in Status.choices]:
            return Response(
                {"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST
            )

        if not (request.user.is_staff or request.user.is_superuser):
            try:
                employee = Employee.objects.get(email=request.user.email)
                if task.employee != employee:
                    return Response(
                        {"error": "You can only update your own tasks"},
                        status=status.HTTP_403_FORBIDDEN,
                    )
            except Employee.DoesNotExist:
                return Response(
                    {"error": "Employee profile not found"},
                    status=status.HTTP_403_FORBIDDEN,
                )

        task.status = new_status
        task.save()
        serializer = self.get_serializer(task)
        return Response(
            {"message": "Status updated successfully", "task": serializer.data},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def my_tasks(self, request):
        try:
            employee = Employee.objects.get(email=request.user.email)
            tasks = Task.objects.filter(employee=employee)
            serializer = self.get_serializer(tasks, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Employee.DoesNotExist:
            return Response(
                {"error": "Employee profile not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
