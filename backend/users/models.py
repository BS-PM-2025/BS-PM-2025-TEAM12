from django.db import models
from academics.models import Department

class User(models.Model):
    ROLE_CHOICES = [
        ('student',  'סטודנט'),
        ('lecturer', 'מרצה'),
        ('admin',    'מזכירה'),
    ]

    full_name         = models.CharField(max_length=100)
    email             = models.EmailField(unique=True)
    id_number         = models.CharField(max_length=20, unique=True)
    role              = models.CharField(max_length=10, choices=ROLE_CHOICES)
    registration_date = models.DateTimeField(auto_now_add=True)
    password          = models.CharField(max_length=128)
    reset_token       = models.CharField(max_length=100, null=True, blank=True)
    department        = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    phone_number      = models.CharField(max_length=20, blank=True)
    # שדה לאישור מרצים (סטודנטים יראו כברירת מחדל כתאושרו)
    is_approved       = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.full_name} – {self.get_role_display()}"
