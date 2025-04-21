from rest_framework import serializers
from .models import User
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'id_number', 'role', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'validators': []},
            'id_number': {'validators': []},
        }

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("האימייל כבר קיים במערכת.")
        return value

    def validate_id_number(self, value):
        if User.objects.filter(id_number=value).exists():
            raise serializers.ValidationError("תעודת הזהות כבר קיימת במערכת.")
        return value
