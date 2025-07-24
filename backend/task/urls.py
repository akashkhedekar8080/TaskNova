from rest_framework import routers

from .viewsets import DepartmentModelViewSet, EmployeeModelViewSet, TaskModelViewSet

app_name = "tasks"
router = routers.DefaultRouter()
router.register(r"departments", DepartmentModelViewSet, basename="department")
router.register(r"tasks", TaskModelViewSet, basename="task")
router.register(r"employees", EmployeeModelViewSet, basename="employee")
urlpatterns = router.urls
# from .views import (
#     DepartmentAdvancedViewset,
#     DepartmentBasicGenericViewset,
#     DepartmentFullCRUDGenericViewSet,
#     DepartmentListCreateGenericViewSet,
#     DepartmentModelViewset,
#     DepartmentReadOnlyViewSet,
#     # DepartmentMixinView,
#     DepartmentViewSet,
# )

# Generic Views
# from .views import (
#     BulkDepartmentOperationsView,
#     DeparementRetriveDeleteView,
#     DeparementRetriveUpdateDeleteView,
#     DeparementRetriveUpdateView,
#     DeparmentDetialView,
#     DepartementDetailWithStat,
#     DepartmentCreateValidateView,
#     DepartmentCreateView,
#     DepartmentDestroyView,
#     DepartmentListCreateView,
#     DepartmentListView,
#     DepartmentUpdateView,
# )

# API view
# from .views import (
#     ActiveDepartmentView,
#     DepartMentDetailView,
#     DepartMentListView,
#     DepartMentStatsView,
# )

# FBV
# from .views import (
#     HelloApiView,
#     active_deparment,
#     deparment_detail,
#     department_list,
#     department_list_create,
# )

# router = routers.DefaultRouter()
# router.register(
#     r"departments-basic", DepartmentBasicGenericViewset, basename="department_basic"
# )
# router.register(
#     r"departments-list-create",
#     DepartmentListCreateGenericViewSet,
#     basename="department_list_creat",
# )
# router.register(
#     r"departments-full-crud",
#     DepartmentFullCRUDGenericViewSet,
#     basename="department_full_crud",
# )
# router.register(r"departments", DepartmentViewSet, basename="department")
# router.register(r"mdepartments", DepartmentModelViewset, basename="mdepartment")
# router.register(r"rdepartments", DepartmentReadOnlyViewSet, basename="rdepartment")
# router.register(r"adepartments", DepartmentAdvancedViewset, basename="adepartment")

# app_name = "tasks"
# urlpatterns = [
#     path("departments/", DepartmentMixinView.as_view(), name="department-list-create"),
#     path(
#         "departments/<uuid:pk>/",
#         DepartmentMixinView.as_view(),
#         name="department-detail",
#     ),
# ]

# urlpatterns = router.urls
# urlpatterns = [
# Generic views
# path(
#     "<uuid:pk>/detail-stat/",
#     DepartementDetailWithStat.as_view(),
#     name="department_detail_stats",
# ),
# path("create/", DepartmentCreateView.as_view(), name="department_create"),
# path(
#     "bulk-update/",
#     BulkDepartmentOperationsView.as_view(),
#     name="department_bulk_update",
# ),
# path("list/", DepartmentListView.as_view(), name="department_list"),
# path(
#     "create-validate/",
#     DepartmentCreateValidateView.as_view(),
#     name="department_create_validate",
# ),
# path(
#     "list-create/",
#     DepartmentListCreateView.as_view(),
#     name="department_list_create",
# ),
# path(
#     "<uuid:pk>/retrive-update/",
#     DeparementRetriveUpdateView.as_view(),
#     name="department_retrive_update",
# ),
# path(
#     "<uuid:pk>/retrive-delete/",
#     DeparementRetriveDeleteView.as_view(),
#     name="department_retrive_delete",
# ),
# path(
#     "<uuid:pk>/retrive-update-delete/",
#     DeparementRetriveUpdateDeleteView.as_view(),
#     name="department_retrive_update_delete",
# ),
# path(
#     "<slug:slug>/detail/", DeparmentDetialView.as_view(), name="department_detail"
# ),
# path("<uuid:pk>/update/", DepartmentUpdateView.as_view(), name="department_update"),
# path(
#     "<uuid:pk>/delete/", DepartmentDestroyView.as_view(), name="department_delete"
# ),
# APi view
# path("list/", DepartMentListView.as_view(), name="department_list"),
# path("stats/", DepartMentStatsView.as_view(), name="department_stats"),
# path(
#     "<slug:slug>/detail/", DepartMentDetailView.as_view(), name="department_detail"
# ),
# path(
#     "<slug:slug>/active/", ActiveDepartmentView.as_view(), name="department_active"
# ),
# FBV
#     path("", HelloApiView.as_view(), name="home"),
#     path("list/", department_list, name="department_list"),
#     path("list-create/", department_list_create, name="department_list_create"),
#     path("<slug:slug>/detail/", deparment_detail, name="department_detail"),
#     path("<slug:slug>/active/", active_deparment, name="active_department"),
# ]
