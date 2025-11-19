from rest_framework import generics, status, serializers
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model, authenticate
from .serializers import UserRegisterSerializer
from .models import CustomUser
from rest_framework.permissions import IsAuthenticated
from .models import LessonProgress
from .serializers import LessonProgressSerializer



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
    """Permite iniciar sesión con email o username y validar el rol esperado."""
    def validate(self, attrs):
        username_or_email = attrs.get("username")
        password = attrs.get("password")
        expected_role = self.context['request'].data.get("expected_role")  # 👈 Nuevo parámetro

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

        # 🚫 Validar tipo de rol
        if expected_role and user.role != expected_role:
            raise serializers.ValidationError(
                f"Este usuario no tiene permisos para ingresar como {expected_role}."
            )

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
            "linked_parent": student.linked_student.username if student.linked_student else None,
            "age_group": student.age_group,  # 👈 ESTE CAMPO ES CLAVE
            "age": student.age,  # 👈 También inclúyelo para verificar que llega
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

@api_view(['POST'])
def set_student_age_group(request):
    username = request.data.get("username")
    age_group = request.data.get("age_group")

    if not username or not age_group:
        return Response({"error": "Faltan campos requeridos."}, status=400)

    try:
        student = CustomUser.objects.get(username=username, role="student")
        student.age_group = age_group
        student.save()

        return Response({
            "message": "Edad actualizada correctamente",
            "age_group": student.age_group,
        })
    except CustomUser.DoesNotExist:
        return Response({"error": "Estudiante no encontrado"}, status=404)

# ✅ Lista el progreso del usuario logueado
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_progress(request):
    progress_qs = LessonProgress.objects.filter(user=request.user)
    serializer = LessonProgressSerializer(progress_qs, many=True)
    return Response(serializer.data, status=200)


# ✅ Crear / actualizar el progreso de una lección
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_lesson_progress(request):
    lesson_id = request.data.get("lesson_id")
    score = request.data.get("score", 1)
    time_spent = request.data.get("time", 0)
    xp = request.data.get("xp", 0)

    if not lesson_id:
        return Response({"error": "lesson_id es requerido."}, status=400)

    progress, created = LessonProgress.objects.update_or_create(
        user=request.user,
        lesson_id=lesson_id,
        defaults={
            "score": score,
            "time": time_spent,
            "xp": xp,
            "completed": True,
        }
    )

    serializer = LessonProgressSerializer(progress)
    return Response(serializer.data, status=200)

@api_view(["GET"])
def get_leaderboard(request):
    # Tomamos solo usuarios estudiante
    students = CustomUser.objects.filter(role="student")

    leaderboard = []

    for student in students:
        # Buscar progreso del estudiante
        progress_rows = LessonProgress.objects.filter(user=student)
        total_xp = sum([p.xp for p in progress_rows])

        leaderboard.append({
            "username": student.username,
            "xp": total_xp,
            "age_group": student.age_group,
        })

    # Ordenar de mayor a menor XP
    leaderboard = sorted(leaderboard, key=lambda x: x["xp"], reverse=True)

    return Response(leaderboard)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_me(request):
    user = request.user
    return Response({
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "age_group": user.age_group,
    })
