from django.contrib import admin
from .models import Request, RequestComment, Notification

@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = ('student', 'request_type', 'subject', 'status', 'submitted_at', 'assigned_lecturer')
    list_filter = ('status', 'request_type', 'submitted_at')
    search_fields = ('student__username', 'subject', 'description')
    date_hierarchy = 'submitted_at'

@admin.register(RequestComment)
class RequestCommentAdmin(admin.ModelAdmin):
    list_display = ('request', 'author', 'content', 'timestamp', 'is_read')
    list_filter = ('is_read', 'timestamp')
    search_fields = ('content', 'author__username')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'created_at', 'is_read')
    list_filter = ('is_read', 'created_at')
    search_fields = ('message', 'user__username') 