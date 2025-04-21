
from django.db import models

class User(models.Model):
    ROLE_CHOICES = [
        ('student', 'student'),  # סטודנט
        ('lecturer', 'lecturer'),  # מרצה
        ('admin', 'admin'),  # מזכירה
    ]

    full_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    id_number = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    registration_date = models.DateTimeField(auto_now_add=True)
    password = models.CharField(max_length=128)
    reset_token = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.full_name} - {self.get_role_display()}"
