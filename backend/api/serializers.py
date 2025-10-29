from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'age', 'role']

    def validate_email(self, value):
        """Normaliza el email y valida duplicados."""
        if not value:
            raise serializers.ValidationError("El correo electrónico es obligatorio.")
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value

    def create(self, validated_data):
        validated_data['email'] = validated_data['email'].lower().strip()

        # Crear usuario principal
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            age=validated_data.get('age'),
            role=validated_data.get('role', 'student'),
        )

        # Si es apoderado, crear un estudiante vinculado con email ficticio
        if user.role == 'parent':
            fake_email = f"{user.username.lower()}_child@cyberkids.local"
            User.objects.create_user(
                username=f"student_{user.username}",
                email=fake_email,
                password="1234",
                role="student",
                linked_student=user
            )

        return user
