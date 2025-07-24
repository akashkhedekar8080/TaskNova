# import logging

# from django.db.models import Q
# from django.shortcuts import get_object_or_404
# from django_filters.rest_framework import DjangoFilterBackend
# from rest_framework import filters, generics, mixins, status, viewsets
# from rest_framework.decorators import action
# from rest_framework.response import Response

# from .models import Department
# from .serializers import DepartmentSerializer, EmployeeSerializer

# logger = logging.getLogger(__name__)


# class DepartmentBasicGenericViewset(viewsets.GenericViewSet):
#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer

#     def list(self, request):
#         queryset = self.get_queryset()
#         serializer = self.get_serializer(queryset, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     def retrieve(self, request, pk=None):
#         instance = self.get_object()
#         serializer = self.get_serializer(instance)
#         return Response(serializer.data, status=status.HTTP_200_OK)


# class DepartmentListCreateGenericViewSet(
#     mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet
# ):
#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer

#     def get_queryset(self):
#         queryset = super().get_queryset()

#         # Filter by active status if provided
#         is_active = self.request.query_params.get("is_active")
#         if is_active is not None:
#             queryset = queryset.filter(is_active=is_active.lower() == "true")

#         return queryset


# class DepartmentFullCRUDGenericViewSet(
#     mixins.CreateModelMixin,
#     mixins.RetrieveModelMixin,
#     mixins.UpdateModelMixin,
#     mixins.DestroyModelMixin,
#     mixins.ListModelMixin,
#     viewsets.GenericViewSet,
# ):
#     """
#     GenericViewSet with all CRUD operations - this is essentially ModelViewSet
#     """

#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer

#     def perform_create(self, serializer):
#         """Custom logic during creation"""
#         serializer.save()

#     def perform_update(self, serializer):
#         """Custom logic during update"""
#         serializer.save()

#     def perform_destroy(self, instance):
#         """Custom logic during deletion"""
#         instance.delete()


# # Create your views here.
# class DepartmentMixinView(
#     mixins.ListModelMixin,
#     mixins.CreateModelMixin,
#     mixins.DestroyModelMixin,
#     mixins.RetrieveModelMixin,
#     mixins.UpdateModelMixin,
#     generics.GenericAPIView,
# ):
#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer

#     def get(self, request, *args, **kwargs):
#         if "pk" in kwargs:
#             return self.retrieve(request, *args, **kwargs)
#         return self.list(request, *args, **kwargs)

#     def post(self, request, *args, **kwargs):
#         return self.create(request, *args, **kwargs)

#     def put(self, request, *args, **kwargs):
#         return self.update(request, *args, **kwargs)

#     def patch(self, request, *args, **kwargs):
#         return self.partial_update(request, *args, **kwargs)

#     def delete(self, request, *args, **kwargs):
#         return self.destroy(request, *args, **kwargs)


# class DepartmentViewSet(viewsets.ViewSet):
#     def list(self, request):
#         queryset = Department.objects.all()
#         serializer = DepartmentSerializer(queryset, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     def create(self, request):
#         serilizer = DepartmentSerializer(data=request.data)
#         if serilizer.is_valid():
#             serilizer.save()
#             return Response(serilizer.data, status=status.HTTP_201_CREATED)
#         return Response(serilizer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def retrieve(self, request, pk=None):
#         department = get_object_or_404(Department, pk=pk)
#         serializer = DepartmentSerializer(department)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     def update(self, request, pk=None):
#         deparment = get_object_or_404(Department, pk=pk)
#         serializer = DepartmentSerializer(deparment, data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def partial_update(self, request, pk=None):
#         deparment = get_object_or_404(Department, pk=pk)
#         serializer = DepartmentSerializer(deparment, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def destroy(self, request, pk=None):
#         deparment = get_object_or_404(Department, pk=pk)
#         deparment.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


# class DepartmentModelViewset(viewsets.ModelViewSet):
#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer
#     filter_backends = [
#         DjangoFilterBackend,
#         filters.SearchFilter,
#         filters.OrderingFilter,
#     ]
#     search_fields = ["name", "description"]
#     ordering_fields = ["name", "created_at", "updated_at"]
#     ordering = ["name"]  # Default ordering

#     def get_queryset(self):
#         queryset = Department.objects.all()
#         is_active = self.request.query_params.get("is_active", None)
#         if is_active is not None:
#             queryset = queryset.filter(is_active=is_active.lower() == "true")
#         search = self.request.query_params.get("search", None)
#         if search:
#             queryset = queryset.filter(
#                 Q(name__icontains=search) | Q(description__icontains=search)
#             )
#         return queryset

#     def get_serializer_class(self):
#         if self.action == "list":
#             return DepartmentSerializer
#         elif self.action == "create":
#             return DepartmentSerializer  # You could use a create-specific serializer
#         return DepartmentSerializer

#     def get_permissions(self):
#         """Different permissions for different actions"""
#         from rest_framework.permissions import (
#             IsAuthenticated,
#             IsAuthenticatedOrReadOnly,
#         )

#         if self.action == "list" or self.action == "retrieve":
#             permission_classes = [IsAuthenticatedOrReadOnly]
#         else:
#             permission_classes = [IsAuthenticated]

#         return [permission() for permission in permission_classes]

#     def perform_create(self, serializer):
#         serializer.save()

#     def perform_update(self, serializer):
#         serializer.save()

#     def perform_destroy(self, instance):
#         instance.delete()


# class DepartmentReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer


# class DepartmentAdvancedViewset(viewsets.ModelViewSet):
#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer

#     @action(detail=True, methods=["post"])
#     def activate(self, request, pk=None):
#         department = self.get_object()
#         department.is_active = True
#         department.save()

#         serializer = self.get_serializer(department)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     @action(detail=True, methods=["post"])
#     def deactivate(self, request, pk=None):
#         department = self.get_object()
#         department.is_active = False
#         department.save()
#         serializer = self.get_serializer(department)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     @action(detail=False, methods=["get"])
#     def active(self, request):
#         department = Department.objects.filter(is_active=True)
#         serializer = self.get_serializer(department, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     @action(detail=False, methods=["get"])
#     def inactive(self, request):
#         department = Department.objects.filter(is_active=False)
#         serializer = self.get_serializer(department, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     @action(detail=False, methods=["get"])
#     def stat(self, request):
#         return Response(
#             {
#                 "total": Department.objects.all().count(),
#                 "active": Department.objects.filter(is_active=True).count(),
#                 "inactive": Department.objects.filter(is_active=False).count(),
#             }
#         )

#     @action(detail=True, methods=["get"])
#     def employees(self, request, pk=None):
#         department = self.get_object()
#         employees = department.employees.all()
#         serializer = EmployeeSerializer(employees, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     @action(detail=False, methods=["post"])
#     def bulk_create(self, request):
#         serializer = self.get_serializer(data=request.data, many=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     @action(detail=False, methods=["patch"])
#     def bulk_update(self, request):
#         department_ids = request.data.get("ids", [])
#         update_data = request.data.get("data", {})
#         if not department_ids:
#             return Response(
#                 {"error": "No department IDs provided"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )
#         departments = Department.objects.filter(id__in=department_ids)
#         for department in departments:
#             for key, value in department.items():
#                 setattr(department, key, value)
#         Department.bulk_update(departments, fields=update_data.keys())
#         serializer = self.get_serializer(departments, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)


# Generic View
# class DepartmentListView(generics.ListAPIView):
#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer


# class DepartmentCreateView(generics.CreateAPIView):
#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer


# class DeparmentDetialView(generics.RetrieveAPIView):
#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer
#     lookup_field = "slug"


# class DepartmentUpdateView(generics.UpdateAPIView):
#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer


# class DepartmentDestroyView(generics.DestroyAPIView):
#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer


# class DepartmentListCreateView(generics.ListCreateAPIView):
#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer

#     def perform_create(self, serializer):
#         serializer.save()


# class DeparementRetriveUpdateView(generics.RetrieveUpdateAPIView):
#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer


# class DeparementRetriveDeleteView(generics.RetrieveDestroyAPIView):
#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer


# class DeparementRetriveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer


# class DepartementDetailWithStat(generics.RetrieveAPIView):
#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer

#     def retrieve(self, request, *args, **kwargs):
#         instance = self.get_object()
#         serializer = self.get_serializer(instance)
#         data = serializer.data
#         data["total_employee"] = instance.employees.count()
#         data["active_employee"] = instance.employees.filter(is_active=True).count()
#         return Response(data, status=status.HTTP_200_OK)


# class DepartmentCreateValidateView(generics.CreateAPIView):
#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer

#     def perform_create(self, serializer):
#         name = serializer.validated_data["name"]
#         if Department.objects.filter(name__iexact=name).exists():
#             raise ValidationError("Department with this name already exists!!")
#         serializer.save()


# class BulkDepartmentOperationsView(generics.GenericAPIView):
#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer

#     def post(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data, many=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def patch(self, request, *args, **kwargs):
#         deparment_ids = request.data.get("ids", [])
#         updated_data = request.data.get("data", {})
#         if not deparment_ids:
#             return Response(
#                 {"error": "No department IDs provided"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )
#         deparments = Department.objects.filter(id__in=deparment_ids)
#         for department in deparments:
#             for key, value in updated_data.items():
#                 setattr(department, key, value)
#         Department.objects.bulk_update(deparments, updated_data.keys())
#         serializer = self.get_serializer(deparments, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)


# APIView
# class DepartMentListView(APIView):
#     def get(self, request, format=None):
#         deparment = Department.objects.all()
#         serializer = DepartmentSerializer(deparment, many=True)
#         return Response(serializer.data)

#     def post(self, request, format=None):
#         serializer = DepartmentSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class DepartMentDetailView(APIView):
#     def get_object(self, slug):
#         return get_object_or_404(Department, slug=slug)

#     def get(self, request, slug, format=None):
#         department = self.get_object(slug)
#         serializer = DepartmentSerializer(department)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     def put(self, request, slug, format=None):
#         department = self.get_object(slug)
#         serializer = DepartmentSerializer(department, data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def patch(self, request, slug, format=None):
#         department = self.get_object(slug)
#         serializer = DepartmentSerializer(department, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, slug, format=None):
#         department = self.get_object(slug)
#         department.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


# class ActiveDepartmentView(APIView):
#     def post(self, request, slug, format=None):
#         department = get_object_or_404(Department, slug=slug)
#         department.is_active = True
#         department.save()
#         setrializer = DepartmentSerializer(department)
#         return Response(setrializer.data, status=status.HTTP_200_OK)


# class DepartMentStatsView(APIView):
#     def get(self, request, format=None):
#         stats = {
#             "total_department": Department.objects.all().count(),
#             "active_department": Department.objects.filter(is_active=True).count(),
#             "inactive_department": Department.objects.filter(is_active=False).count(),
#         }
#         return Response(stats, status=status.HTTP_200_OK)


# class HelloApiView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         # logger.info("hello %s", request.query_params.get("name"))
#         return Response({"message": "Hello, World"})

#     def post(self, request):
#         data = request.data
#         return Response({"recieve": data}, status=status.HTTP_201_CREATED)


# # FBV
# @api_view(["POST"])
# def active_deparment(request, slug):
#     department = get_object_or_404(Department, slug=slug)
#     department.is_active = True
#     department.save()
#     serializer = DepartmentSerializer(department)
#     return Response(serializer.data)


# @api_view(["GET"])
# def department_list(request):
#     dep = Department.objects.all()
#     serializer = DepartmentSerializer(dep, many=True)
#     return Response(serializer.data)


# @api_view(["GET", "POST"])
# def department_list_create(request):
#     if request.method == "GET":
#         dep = Department.objects.all()
#         serializer = DepartmentSerializer(dep, many=True)
#         return Response(serializer.data)
#     if request.method == "POST":
#         serializer = DepartmentSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# @api_view(["GET", "PUT", "DELETE"])
# def deparment_detail(request, slug):
#     department = get_object_or_404(Department, slug=slug)
#     if request.method == "GET":
#         serializer = DepartmentSerializer(department)
#         return Response(serializer.data)
#     if request.method == "PUT":
#         serializer = DepartmentSerializer(department, data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#     if request.method == "DELETE":
#         department.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)

# ORM queries 
# Django ORM Practice with your actual models
# from django.db import models
# from django.utils import timezone
# from django.db.models import Q, F, Count, Sum, Avg, Max, Min
# from datetime import datetime, timedelta
# from .models import Department, Employee, Task, Status, Priority

# # =============================================================================
# # 1. BASIC CRUD OPERATIONS
# # =============================================================================

# # CREATE Operations
# def create_examples():
#     """Different ways to create objects"""
    
#     # Method 1: Create and save
#     dept = Department()
#     dept.name = "Engineering"
#     dept.description = "Software development team"
#     dept.is_active = True
#     dept.save()
    
#     # Method 2: Using create() - saves automatically
#     hr_dept = Department.objects.create(
#         name="Human Resources",
#         description="HR operations and employee management",
#         is_active=True
#     )
    
#     # Method 3: Using get_or_create() - prevents duplicates
#     marketing_dept, created = Department.objects.get_or_create(
#         name="Marketing",
#         defaults={
#             'description': "Marketing and sales operations",
#             'is_active': True
#         }
#     )
    
#     # Create Employee
#     employee = Employee.objects.create(
#         department=dept,
#         first_name="John",
#         last_name="Doe", 
#         designation="Software Engineer",
#         email="john.doe@company.com",
#         phone="1234567890",
#         is_active=True
#     )
    
#     # Create Task
#     task = Task.objects.create(
#         employee=employee,
#         title="Setup development environment",
#         description="Install and configure all necessary tools",
#         status=Status.TODO,
#         priority=Priority.HIGH,
#         due_date=timezone.now() + timedelta(days=7),
#         estimated_sp=5
#     )
    
#     print(f"Created: {dept}, {employee}, {task}")
#     return dept, employee, task

# # READ Operations
# def read_examples():
#     """Different ways to query objects"""
    
#     # Get all objects
#     all_departments = Department.objects.all()
#     all_employees = Employee.objects.all()
#     all_tasks = Task.objects.all()
    
#     # Get single object
#     try:
#         dept = Department.objects.get(name="Engineering")
#         emp = Employee.objects.get(email="john.doe@company.com")
#         task = Task.objects.get(title="Setup development environment")
#     except Department.DoesNotExist:
#         print("Department not found")
#     except Employee.MultipleObjectsReturned:
#         print("Multiple employees found")
    
#     # Get or create
#     dept, created = Department.objects.get_or_create(
#         name="Finance",
#         defaults={'description': 'Financial operations'}
#     )
    
#     # Get first/last
#     first_dept = Department.objects.first()
#     last_dept = Department.objects.last()
    
#     # Filter operations
#     active_departments = Department.objects.filter(is_active=True)
#     inactive_departments = Department.objects.filter(is_active=False)
    
#     # Exclude operations
#     non_hr_departments = Department.objects.exclude(name="Human Resources")
    
#     # Get specific fields only
#     dept_names = Department.objects.values_list('name', flat=True)
#     dept_info = Department.objects.values('id', 'name', 'description')
    
#     return all_departments, active_departments, dept_names

# # UPDATE Operations
# def update_examples():
#     """Different ways to update objects"""
    
#     # Update single object
#     try:
#         dept = Department.objects.get(name="Engineering")
#         dept.description = "Updated description"
#         dept.save()
        
#         # Or update specific fields only
#         dept.save(update_fields=['description'])
#     except Department.DoesNotExist:
#         pass
    
#     # Bulk update
#     Department.objects.filter(is_active=True).update(
#         updated_at=timezone.now()
#     )
    
#     # Update or create
#     dept, created = Department.objects.update_or_create(
#         name="IT Support",
#         defaults={
#             'description': 'Technical support team',
#             'is_active': True
#         }
#     )
    
#     # F() expressions for atomic updates
#     Employee.objects.filter(department__name="Engineering").update(
#         updated_at=F('updated_at')
#     )

# # DELETE Operations
# def delete_examples():
#     """Different ways to delete objects"""
    
#     # Delete single object
#     try:
#         dept = Department.objects.get(name="Temporary")
#         dept.delete()
#     except Department.DoesNotExist:
#         pass
    
#     # Bulk delete
#     Department.objects.filter(is_active=False).delete()
    
#     # Delete all (be careful!)
#     # Task.objects.all().delete()  # Uncomment with caution

# # =============================================================================
# # 2. FILTERING AND LOOKUPS
# # =============================================================================

# def filtering_examples():
#     """Various filtering techniques"""
    
#     # Basic filters
#     active_employees = Employee.objects.filter(is_active=True)
#     engineering_employees = Employee.objects.filter(department__name="Engineering")
    
#     # Multiple conditions (AND)
#     active_engineering = Employee.objects.filter(
#         is_active=True,
#         department__name="Engineering"
#     )
    
#     # OR conditions using Q objects
#     from django.db.models import Q
    
#     hr_or_engineering = Employee.objects.filter(
#         Q(department__name="Engineering") | Q(department__name="Human Resources")
#     )
    
#     # NOT conditions
#     not_engineering = Employee.objects.filter(~Q(department__name="Engineering"))
    
#     # Complex Q combinations
#     complex_filter = Employee.objects.filter(
#         Q(department__name="Engineering") & 
#         (Q(first_name__startswith="J") | Q(last_name__startswith="D"))
#     )
    
#     # Field lookups
#     # Text lookups
#     johns = Employee.objects.filter(first_name__icontains="john")
#     starts_with_j = Employee.objects.filter(first_name__startswith="J")
#     ends_with_e = Employee.objects.filter(first_name__endswith="e")
#     exact_match = Employee.objects.filter(first_name__exact="John")
#     case_insensitive = Employee.objects.filter(first_name__iexact="john")
    
#     # Date lookups
#     today = timezone.now().date()
#     recent_employees = Employee.objects.filter(joining_date__date=today)
#     this_year = Employee.objects.filter(joining_date__year=2024)
#     this_month = Employee.objects.filter(
#         joining_date__year=2024,
#         joining_date__month=12
#     )
    
#     # Range lookups
#     date_range = Employee.objects.filter(
#         joining_date__range=[
#             timezone.now() - timedelta(days=30),
#             timezone.now()
#         ]
#     )
    
#     # Null checks
#     employees_with_phone = Employee.objects.filter(phone__isnull=False)
#     employees_without_phone = Employee.objects.filter(phone__isnull=True)
    
#     # In lookups
#     specific_departments = Employee.objects.filter(
#         department__name__in=["Engineering", "Marketing", "HR"]
#     )
    
#     return active_employees, hr_or_engineering, johns

# # =============================================================================
# # 3. RELATIONSHIP QUERIES
# # =============================================================================

# def relationship_examples():
#     """Working with foreign keys and related objects"""
    
#     # Forward relationship (Employee -> Department)
#     employee = Employee.objects.select_related('department').first()
#     if employee:
#         print(f"Employee: {employee.full_name}, Department: {employee.department.name}")
    
#     # Reverse relationship (Department -> Employees)
#     engineering_dept = Department.objects.get(name="Engineering")
#     engineering_employees = engineering_dept.employees.all()
#     active_engineering_employees = engineering_dept.employees.filter(is_active=True)
    
#     # Count related objects
#     employee_count = engineering_dept.employees.count()
#     active_employee_count = engineering_dept.employees.filter(is_active=True).count()
    
#     # Check if related objects exist
#     has_employees = engineering_dept.employees.exists()
    
#     # Get departments with employees
#     departments_with_employees = Department.objects.filter(employees__isnull=False).distinct()
    
#     # Get departments without employees
#     departments_without_employees = Department.objects.filter(employees__isnull=True)
    
#     # Complex relationship queries
#     # Departments with active employees
#     depts_with_active_employees = Department.objects.filter(
#         employees__is_active=True
#     ).distinct()
    
#     # Employees in active departments
#     employees_in_active_depts = Employee.objects.filter(
#         department__is_active=True
#     )
    
#     # Tasks for employees in specific department
#     engineering_tasks = Task.objects.filter(
#         employee__department__name="Engineering"
#     )
    
#     # High priority tasks for active employees
#     high_priority_active = Task.objects.filter(
#         priority=Priority.HIGH,
#         employee__is_active=True
#     )
    
#     return engineering_employees, engineering_tasks

# # =============================================================================
# # 4. USING CUSTOM MANAGERS
# # =============================================================================

# def custom_manager_examples():
#     """Using the custom TaskManager"""
    
#     # Using custom manager methods
#     todo_tasks = Task.objects.by_status(Status.TODO)
#     high_priority_tasks = Task.objects.by_priority(Priority.HIGH)
#     active_tasks = Task.objects.active_tasks()
#     completed_tasks = Task.objects.completed_tasks()
#     spillover_tasks = Task.objects.spillover_task()
    
#     # Get tasks by employee
#     if Employee.objects.exists():
#         employee = Employee.objects.first()
#         employee_tasks = Task.objects.by_employee(employee)
        
#         # You can chain manager methods
#         employee_active_tasks = Task.objects.by_employee(employee).active_tasks()
#         employee_high_priority = Task.objects.by_employee(employee).by_priority(Priority.HIGH)
    
#     return todo_tasks, spillover_tasks, active_tasks

# # =============================================================================
# # 5. ORDERING AND LIMITING
# # =============================================================================

# def ordering_examples():
#     """Different ways to order querysets"""
    
#     # Basic ordering
#     employees_by_name = Employee.objects.order_by('first_name')
#     employees_by_name_desc = Employee.objects.order_by('-first_name')
    
#     # Multiple field ordering
#     employees_ordered = Employee.objects.order_by('department__name', 'first_name')
    
#     # Random ordering
#     random_employee = Employee.objects.order_by('?').first()
    
#     # Limiting results
#     first_5_employees = Employee.objects.all()[:5]
#     employees_6_to_10 = Employee.objects.all()[5:10]
    
#     # Latest and earliest
#     latest_employee = Employee.objects.latest('joining_date')
#     earliest_employee = Employee.objects.earliest('joining_date')
    
#     # First and last
#     first_employee = Employee.objects.first()
#     last_employee = Employee.objects.last()
    
#     return employees_by_name, first_5_employees

# # =============================================================================
# # 6. PRACTICAL EXAMPLES
# # =============================================================================

# def practical_examples():
#     """Real-world query examples"""
    
#     # 1. Get all departments with their employee count
#     departments_with_count = Department.objects.annotate(
#         employee_count=Count('employees')
#     )
    
#     # 2. Get active employees who joined this year
#     current_year = timezone.now().year
#     new_employees = Employee.objects.filter(
#         is_active=True,
#         joining_date__year=current_year
#     )
    
#     # 3. Get departments that have overdue tasks
#     departments_with_overdue = Department.objects.filter(
#         employees__tasks__due_date__lt=timezone.now(),
#         employees__tasks__status__in=[Status.TODO, Status.IN_PROGRESS]
#     ).distinct()
    
#     # 4. Get employees with their task counts
#     employees_with_task_count = Employee.objects.annotate(
#         task_count=Count('tasks'),
#         pending_tasks=Count('tasks', filter=Q(tasks__status__in=[Status.TODO, Status.IN_PROGRESS]))
#     )
    
#     # 5. Find employees without any tasks
#     employees_without_tasks = Employee.objects.filter(tasks__isnull=True)
    
#     # 6. Get the most recent task for each employee
#     from django.db.models import OuterRef, Subquery
    
#     newest_task = Task.objects.filter(
#         employee=OuterRef('pk')
#     ).order_by('-created_at')
    
#     employees_with_latest_task = Employee.objects.annotate(
#         latest_task_title=Subquery(newest_task.values('title')[:1])
#     )
    
#     return departments_with_count, employees_with_task_count

# # Helper function to run all examples
# def run_all_examples():
#     """Run all the examples"""
#     print("=== Creating sample data ===")
#     create_examples()
    
#     print("\n=== Reading data ===")
#     read_examples()
    
#     print("\n=== Filtering examples ===")
#     filtering_examples()
    
#     print("\n=== Relationship examples ===")
#     relationship_examples()
    
#     print("\n=== Custom manager examples ===")
#     custom_manager_examples()
    
#     print("\n=== Ordering examples ===")
#     ordering_examples()
    
#     print("\n=== Practical examples ===")
#     practical_examples()

