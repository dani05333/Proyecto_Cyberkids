from rest_framework import generics, status, serializers
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model, authenticate
from .serializers import UserRegisterSerializer
from .models import CustomUser

User = get_user_model()

# ✅ Registro
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Usuario creado correctamente",
                "username": user.username,
                "email": user.email,
                "role": user.role,
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ✅ Login con username o email
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Permite iniciar sesión con email o username."""
    def validate(self, attrs):
        username_or_email = attrs.get("username")
        password = attrs.get("password")

        # Si escribió email, obtener username
        try:
            user = User.objects.get(email=username_or_email)
            username_or_email = user.username
        except User.DoesNotExist:
            pass

        user = authenticate(username=username_or_email, password=password)
        if not user:
            raise serializers.ValidationError("Credenciales inválidas o usuario no encontrado.")
        if not user.is_active:
            raise serializers.ValidationError("Esta cuenta está inactiva.")

        data = super().validate(attrs)
        data["username"] = user.username
        data["role"] = user.role
        return data

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


# ✅ Obtener estudiante por username
@api_view(['GET'])
def get_student_by_username(request, username):
    try:
        student = CustomUser.objects.get(username=username, role='student')
        return Response({
            "id": student.id,
            "username": student.username,
            "email": student.email,
            "linked_parent": student.linked_student.username if student.linked_student else None
        })
    except CustomUser.DoesNotExist:
        return Response({"error": "Estudiante no encontrado"}, status=404)


# ✅ Crear hijo vinculado
@api_view(['POST'])
@permission_classes([AllowAny])
def create_child(request):
    try:
        parent_username = request.data.get("parent_username")
        child_name = request.data.get("child_name")
        child_age = request.data.get("child_age")
        child_password = request.data.get("child_password")

        if not all([parent_username, child_name, child_password]):
            return Response({"error": "Faltan campos requeridos."}, status=400)

        parent = CustomUser.objects.get(username=parent_username, role="parent")

        if CustomUser.objects.filter(username=child_name).exists():
            return Response({"error": "Ya existe un usuario con ese nombre."}, status=400)

        fake_email = f"{child_name.lower()}@child.cyberkids.local"

        child = CustomUser.objects.create_user(
            username=child_name,
            email=fake_email,
            password=child_password,
            role="student",
            age=child_age,
            linked_student=parent
        )

        return Response({
            "message": "Hijo creado exitosamente.",
            "child_username": child.username
        }, status=201)

    except CustomUser.DoesNotExist:
        return Response({"error": "Apoderado no encontrado."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
