from rest_framework import serializers
from .models import Department, Course
from users.models import User


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ('id', 'name')

class LecturerShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'full_name']

class CourseSerializer(serializers.ModelSerializer):
    lecturers = LecturerShortSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'name', 'code', 'lecturers']
