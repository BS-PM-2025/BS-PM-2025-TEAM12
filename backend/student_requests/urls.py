# student_requests/urls.py
from django.urls import path
from .views import manage_requests_view
from . import views

urlpatterns = [
    path('create/', views.RequestCreateAPIView.as_view(), name='request-create'),
    path('my-requests/', views.UserRequestsListAPIView.as_view(), name='my-requests'),
    path('by-student/', views.requests_by_student, name='requests-by-student'),
    path('manage/', manage_requests_view, name='manage-requests'),
    path('update-status/<int:pk>/', views.update_request_status, name='update-status'),
    path('comments/<int:pk>/', views.get_request_comments, name='get-comments'),
    path('comments/add/<int:pk>/', views.add_request_comment, name='add-comment'),
    path('comments/mark-read/<int:pk>/', views.mark_comments_as_read, name='mark-comments-read'),
    path(
        'unread/<int:user_id>/',
        views.get_unread_notifications,
        name='notifications-unread'
    ),
    path(
        'mark-read/<int:user_id>/',
        views.mark_notifications_as_read,
        name='notifications-mark-read'
    ),
]