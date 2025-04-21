from django.urls import path
from . import views
from .views import RegisterAPIView,LoginAPIView,ForgotPasswordAPIView,ResetPasswordAPIView
from django.urls import path
from .views import (
    RegisterAPIView,
    LoginAPIView,
    ForgotPasswordAPIView,
    ResetPasswordAPIView,
    update_user,
    ChangePasswordAPIView,
)

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='api-register'),
    path('login/', LoginAPIView.as_view(), name='api-login'),
    path('forgot-password/', ForgotPasswordAPIView.as_view()),
    path('reset-password/<int:user_id>/<str:token>/', ResetPasswordAPIView.as_view()),
    path('update/<int:user_id>/', update_user),
    path('change-password/<int:user_id>/', ChangePasswordAPIView.as_view()),
]

