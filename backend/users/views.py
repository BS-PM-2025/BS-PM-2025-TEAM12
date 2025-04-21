from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User
from .serializers import UserSerializer
from django.contrib.auth.hashers import check_password
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.decorators import api_view
from rest_framework.parsers import JSONParser
from rest_framework import serializers
import re

class RegisterAPIView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            send_mail(
                subject='Registration Successful',
                message=f"Dear {user.full_name}, your registration was successful!",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False
            )
            return Response({'message': 'User registered successfully.'}, status=status.HTTP_201_CREATED)

        # החזרת הודעת שגיאה אחת בודדת ומובנת
        return Response({
            "error": next(iter(serializer.errors.values()))[0]
        }, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'You must fill in an email and password.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            if check_password(password, user.password):
                return Response({
                    'message': 'התחברת בהצלחה!',
                    'full_name': user.full_name,
                    'email': user.email,
                    'role': user.role,
                    'id': user.id,  # 👈 מזהה משתמש
                    'registration_date': user.registration_date  # 👈 תאריך הרשמה
                }, status=status.HTTP_200_OK)

            else:
                return Response({'error': 'סיסמא שגויה!'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'משתמש לא נמצא'}, status=status.HTTP_404_NOT_FOUND)

class ForgotPasswordAPIView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'נא להזין אימייל'}, status=400)

        try:
            user = User.objects.get(email=email)
            token = get_random_string(50)
            user.reset_token = token
            user.save()

            reset_link = f"http://localhost:3000/reset-password/{user.id}/{token}"

            send_mail(
                'איפוס סיסמה',
                f'קישור לאיפוס הסיסמה: {reset_link}',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )

            return Response({'message': 'קישור איפוס נשלח למייל'})
        except User.DoesNotExist:
            return Response({'error': 'אימייל לא נמצא'}, status=404)

class ResetPasswordAPIView(APIView):
    def post(self, request, user_id, token):
        password = request.data.get('password')
        confirm = request.data.get('confirm')

        if not password or password != confirm:
            return Response({'error': 'הסיסמאות לא תואמות'}, status=400)

        try:
            user = User.objects.get(id=user_id, reset_token=token)
            user.password = make_password(password)
            user.reset_token = None
            user.save()
            return Response({'message': 'הסיסמה אופסה בהצלחה'})
        except User.DoesNotExist:
            return Response({'error': 'קישור לא תקין'}, status=400)


@api_view(['PUT'])
def update_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'משתמש לא נמצא'}, status=404)

    data = request.data
    user.full_name = data.get('full_name', user.full_name)
    user.email = data.get('email', user.email)
    user.save()

    return Response({'message': 'הפרופיל עודכן בהצלחה!'})

class ChangePasswordAPIView(APIView):
    def put(self, request, user_id):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'משתמש לא נמצא'}, status=404)

        if not check_password(old_password, user.password):
            return Response({'error': 'הסיסמה הנוכחית שגויה'}, status=400)

        user.password = make_password(new_password)
        user.save()
        return Response({'message': 'הסיסמה עודכנה בהצלחה'})
