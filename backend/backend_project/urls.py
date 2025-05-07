# backend/backend_project/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # 1. בשביל login, register וכו' לפי מה שה־frontend שלך קורא:
    #    /User/register/, /User/login/, /User/forgot-password/ ...
    path('User/', include('users.urls')),

    # 2. בשביל API של department:
    #    /api/users/department/<id>/
    path('api/users/', include('users.urls')),

    path('academics/', include('academics.urls')),
]
