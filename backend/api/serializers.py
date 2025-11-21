from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import CustomUser, LessonProgress

import secrets
import string

User = get_user_model()

# --------------------------------------------------------
# 🔐 Función para generar CONTRASEÑA SEGURA
# --------------------------------------------------------
def generate_secure_password(length=10):
    chars = string.ascii_letters + string.digits + "!@#$%^&*?"
    return ''.join(secrets.choice(chars) for _ in range(length))


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'age', 'role']

    # --------------------------------------------------------
    # Validar USERNAME duplicado
    # --------------------------------------------------------
    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError("El nombre de usuario es obligatorio.")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está registrado.")
        return value

    # --------------------------------------------------------
    # Validar email en minúsculas y sin duplicados
    # --------------------------------------------------------
    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("El correo electrónico es obligatorio.")
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value

    # --------------------------------------------------------
    # VALIDAR CONTRASEÑA SEGURA DEL APODERADO / COLEGIO
    # --------------------------------------------------------
    def validate_password(self, value):
        import re

        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres.")

        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError("Debe contener al menos una letra mayúscula.")

        if not re.search(r"[a-z]", value):
            raise serializers.ValidationError("Debe contener al menos una letra minúscula.")

        if not re.search(r"[0-9]", value):
            raise serializers.ValidationError("Debe contener al menos un número.")

        if not re.search(r"[!@#$%^&*?.\-_+=/\\()[\]{};,:\|]", value):
            raise serializers.ValidationError("Debe contener al menos un símbolo.")

        return value

    # --------------------------------------------------------
    # Crear usuario (igual que antes)
    # --------------------------------------------------------
    def create(self, validated_data):
        validated_data['email'] = validated_data['email'].lower().strip()

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            age=validated_data.get('age'),
            role=validated_data.get('role', 'student'),
        )

        if user.role == 'parent':
            fake_email = f"{user.username.lower()}_child@cyberkids.local"
            child_password = generate_secure_password()

            child = User.objects.create_user(
                username=f"student_{user.username}",
                email=fake_email,
                password=child_password,
                role="student",
                linked_student=user
            )

            user.generated_child_password = child_password

        return user



# --------------------------------------------------------
# Serializer del progreso de lecciones
# --------------------------------------------------------
class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = ['lesson_id', 'score', 'time', 'xp', 'completed', 'updated_at']
