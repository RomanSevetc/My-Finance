from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth import login as auth_login
from .models import CustomUser


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'birth_date': user.birth_date.isoformat() if user.birth_date else None,
            'gender': user.gender,
            'balance': user.balance,
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'date_joined': user.date_joined.isoformat(),
            'is_active': user.is_active,
            'avatar': request.build_absolute_uri(user.avatar.url) if user.avatar else None,  # Полный URL
        }
        return Response(data, status=status.HTTP_200_OK)


class AvatarUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        avatar_file = request.FILES.get('avatar')
        if not avatar_file:
            return Response({'error': 'Файл аватара отсутствует'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Удаляем старый аватар, если он существует
            if user.avatar:
                user.avatar.delete(save=False)
            user.avatar = avatar_file

            # Ограничение размера файла (5MB)
            if avatar_file.size > 5 * 1024 * 1024:
                return Response({'error': 'Файл слишком большой (максимум 5MB)'}, status=status.HTTP_400_BAD_REQUEST)

            user.save()
            # Возвращаем полный URL
            avatar_url = request.build_absolute_uri(user.avatar.url) if user.avatar else None
            return Response(
                {
                    'message': 'Аватар успешно загружен',
                    'avatar': avatar_url
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response({'error': f'Ошибка при сохранении аватара: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        birth_date = request.data.get('birth_date', None)
        gender = request.data.get('gender', None)

        if not username or not email or not password:
            return Response(
                {'error': 'Имя пользователя, email и пароль обязательны'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if CustomUser.objects.filter(username=username).exists():
            return Response(
                {'error': 'Имя пользователя уже занято'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if CustomUser.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email уже зарегистрирован'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = CustomUser.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            birth_date=birth_date,
            gender=gender,
        )

        token = Token.objects.create(user=user)

        return Response(
            {
                'message': 'Пользователь успешно зарегистрирован',
                'token': token.key,
                'user': {
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'birth_date': user.birth_date.isoformat() if user.birth_date else None,
                    'gender': user.gender,
                    'balance': user.balance,
                    'last_login': user.last_login.isoformat() if user.last_login else None,
                    'date_joined': user.date_joined.isoformat(),
                    'is_active': user.is_active,
                    'avatar': request.build_absolute_uri(user.avatar.url) if user.avatar else None,  # Полный URL
                }
            },
            status=status.HTTP_201_CREATED
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({'message': 'Успешно вышли из системы'}, status=status.HTTP_200_OK)


class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user is not None:
            auth_login(request, user)
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Неверные учетные данные'},
                status=status.HTTP_400_BAD_REQUEST
            )