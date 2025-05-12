from rest_framework import serializers
from .models import Request, RequestComment, Notification
from users.models import User

class LecturerShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'full_name']

class RequestCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    is_read = serializers.BooleanField(read_only=True)
    class Meta:
        model = RequestComment
        fields = ['id', 'author_name', 'content', 'timestamp', 'is_read']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'message', 'is_read', 'created_at']

class RequestSerializer(serializers.ModelSerializer):
    assigned_lecturer = LecturerShortSerializer(read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    feedback = serializers.CharField(allow_blank=True, required=False)

    assigned_lecturer_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='lecturer'),
        source='assigned_lecturer',
        write_only=True,
        required=False
    )

    class Meta:
        model = Request
        fields = [
            'id',
            'student',
            'student_name',
            'request_type',
            'subject',
            'description',
            'attached_file',
            'submitted_at',
            'status',
            'assigned_lecturer',
            'assigned_lecturer_id',
            'feedback',
        ]
