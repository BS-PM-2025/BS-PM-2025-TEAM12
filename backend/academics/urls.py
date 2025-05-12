# academics/urls.py
from django.urls import path
from .views import DepartmentListAPIView, CoursesByDepartmentAPIView

urlpatterns = [
    path('api/departments/', DepartmentListAPIView.as_view(), name='department-list'),
    path('api/courses/', CoursesByDepartmentAPIView.as_view(), name='courses-by-department'),
]
