# backend/users/serializers.py

from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User
from academics.models import Department

class UserSerializer(serializers.ModelSerializer):
    # Allow department selection and optional phone number
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        required=False,
        allow_null=True,
        help_text="ID של המחלקה"
    )
    phone_number = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="מספר טלפון"
    )
    is_approved = serializers.BooleanField(
        required=False,
        help_text="סטטוס אישור מרצה"
    )

    class Meta:
        model = User
        fields = [
            'id',
            'full_name',
            'email',
            'id_number',
            'role',
            'department',
            'phone_number',
            'is_approved',
            'password',
        ]
        extra_kwargs = {
            'password':  {'write_only': True},
            'email':     {'validators': []},
            'id_number': {'validators': []},
        }

    def create(self, validated_data):
        # Extract department & phone
        dept = validated_data.pop('department', None)
        phone = validated_data.pop('phone_number', '')
        raw_pwd = validated_data.pop('password')
        role = validated_data.get('role')

        # By default, lecturers need approval, others auto-approved
        if 'is_approved' in validated_data:
            approved = validated_data.pop('is_approved')
        else:
            approved = False if role == 'lecturer' else True

        user = User(**validated_data)
        user.password = make_password(raw_pwd)
        user.department = dept
        user.phone_number = phone
        user.is_approved = approved
        user.save()
        return user

    def update(self, instance, validated_data):
        # Update basic fields
        instance.full_name   = validated_data.get('full_name', instance.full_name)
        instance.email       = validated_data.get('email', instance.email)
        instance.id_number   = validated_data.get('id_number', instance.id_number)
        instance.role        = validated_data.get('role', instance.role)

        # Optional fields
        if 'department' in validated_data:
            instance.department = validated_data.get('department')
        if 'phone_number' in validated_data:
            instance.phone_number = validated_data.get('phone_number')
        if 'is_approved' in validated_data:
            instance.is_approved = validated_data.get('is_approved')

        # Password change
        if 'password' in validated_data:
            instance.password = make_password(validated_data.get('password'))

        instance.save()
        return instance

    def validate_email(self, value):
        qs = User.objects.filter(email=value)
        if self.instance is not None:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("האימייל כבר קיים במערכת.")
        return value

    def validate_id_number(self, value):
        qs = User.objects.filter(id_number=value)
        if self.instance is not None:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("תעודת הזהות כבר קיימת במערכת.")
        return value
