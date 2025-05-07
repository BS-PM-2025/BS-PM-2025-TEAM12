# academics/urls.py
from django.urls import path
from .views import DepartmentListAPIView

urlpatterns = [
    path('api/departments/', DepartmentListAPIView.as_view(), name='department-list'),
]
