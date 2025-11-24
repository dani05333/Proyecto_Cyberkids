from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import CustomUser, LessonProgress

import secrets
import string
import re

User = get_user_model()

# --------------------------------------------------------
# 🔐 GENERADOR DE CONTRASEÑA SEGURA PARA HIJOS
# --------------------------------------------------------
def generate_secure_password(length=10):
    chars = string.ascii_letters + string.digits + "!@#$%^&*?.-_+=/"
    return ''.join(secrets.choice(chars) for _ in range(length))


# =====================================================================
# 🟦 SERIALIZER DE REGISTRO
# =====================================================================
class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'age', 'role']

    # --------------------------------------------------------
    # Validación USERNAME duplicado
    # --------------------------------------------------------
    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError("El nombre de usuario es obligatorio.")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está registrado.")
        return value

    # --------------------------------------------------------
    # Validación EMAIL realista
    # --------------------------------------------------------
    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("El correo electrónico es obligatorio.")

        value = value.lower().strip()

        # Estructura mínima aceptable
        if "@" not in value or "." not in value.split("@")[-1]:
            raise serializers.ValidationError("El correo electrónico no tiene un formato válido.")

        domain = value.split("@")[-1]

        # Dominios falsos comunes
        invalid_domains = [
            "test.com", "fake.com", "correo.com", "email.com",
            "example.com", "mail.com"
        ]
        if domain in invalid_domains:
            raise serializers.ValidationError("Debes ingresar un correo real (no un dominio inventado).")

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")

        return value

    # --------------------------------------------------------
    # Validación CONTRASEÑA SEGURA
    # --------------------------------------------------------
    def validate_password(self, value):
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
    # CREAR USUARIO + CREAR HIJO AUTOMÁTICO SI ES APODERADO
    # --------------------------------------------------------
    def create(self, validated_data):

        validated_data['email'] = validated_data['email'].lower().strip()
        role = validated_data.get('role', 'student')

        # Crear usuario principal
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            age=validated_data.get('age'),
            role=role,
        )

        # --------------------------------------------------------
        # 👨‍👦 Si es APODERADO → crear automáticamente hijo
        # --------------------------------------------------------
        if user.role == 'parent':

            child_password = generate_secure_password()
            fake_email = f"{user.username.lower()}_child@cyberkids.local"

            User.objects.create_user(
                username=f"student_{user.username}",
                email=fake_email,
                password=child_password,
                role="student",
                linked_student=user
            )

            # Para que el RegisterView lo devuelva al frontend
            user.generated_child_password = child_password

        return user


# =====================================================================
# 🟦 SERIALIZER DEL PROGRESO DE LECCIONES
# =====================================================================
class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = [
            'lesson_id',
            'score',
            'time',
            'xp',
            'completed',
            'updated_at'
        ]
