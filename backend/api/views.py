from rest_framework import generics, status, serializers
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from django.contrib.auth import get_user_model, authenticate

from .serializers import (
    UserRegisterSerializer,
    LessonProgressSerializer,
    generate_secure_password,
)

from .models import CustomUser, LessonProgress

User = get_user_model()


# --------------------------------------------------------
# 🟦 REGISTRO
# --------------------------------------------------------
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            child_password = getattr(user, "generated_child_password", None)

            return Response({
                "message": "Usuario creado correctamente",
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "child_password": child_password,
            }, status=201)

        return Response(serializer.errors, status=400)


# --------------------------------------------------------
# 🟦 LOGIN (username o email)
# --------------------------------------------------------
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get("username")
        password = attrs.get("password")
        expected_role = self.context['request'].data.get("expected_role")

        try:
            user = User.objects.get(email=username_or_email)
            username_or_email = user.username
        except User.DoesNotExist:
            pass

        user = authenticate(username=username_or_email, password=password)

        if not user:
            raise serializers.ValidationError("Credenciales inválidas.")
        if not user.is_active:
            raise serializers.ValidationError("Cuenta inactiva.")

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


# --------------------------------------------------------
# 🟦 OBTENER ESTUDIANTE
# --------------------------------------------------------
@api_view(['GET'])
def get_student_by_username(request, username):
    try:
        student = CustomUser.objects.get(username=username, role='student')
        return Response({
            "id": student.id,
            "username": student.username,
            "email": student.email,
            "linked_parent": student.linked_student.username if student.linked_student else None,
            "age_group": student.age_group,
            "age": student.age,
        })
    except CustomUser.DoesNotExist:
        return Response({"error": "Estudiante no encontrado"}, status=404)


# --------------------------------------------------------
# 🟦 SET AGE GROUP
# --------------------------------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_student_age_group(request):
    username = request.data.get("username")
    age_group = request.data.get("age_group")

    if not username or not age_group:
        return Response({"error": "Faltan campos"}, status=400)

    try:
        student = CustomUser.objects.get(username=username, role="student")
        student.age_group = age_group
        student.save()
        return Response({"message": "Edad actualizada", "age_group": student.age_group})
    except CustomUser.DoesNotExist:
        return Response({"error": "Estudiante no encontrado"}, status=404)


# --------------------------------------------------------
# 🟦 PROGRESO
# --------------------------------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_progress(request):
    progress_qs = LessonProgress.objects.filter(user=request.user)
    serializer = LessonProgressSerializer(progress_qs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_lesson_progress(request):
    lesson_id = request.data.get("lesson_id")

    if not lesson_id:
        return Response({"error": "lesson_id requerido"}, status=400)

    progress, created = LessonProgress.objects.update_or_create(
        user=request.user,
        lesson_id=lesson_id,
        defaults={
            "score": request.data.get("score", 1),
            "time": request.data.get("time", 0),
            "xp": request.data.get("xp", 0),
            "completed": True,
        }
    )

    serializer = LessonProgressSerializer(progress)
    return Response(serializer.data)


# --------------------------------------------------------
# 🟦 LEADERBOARD
# --------------------------------------------------------
@api_view(["GET"])
def get_leaderboard(request):
    students = CustomUser.objects.filter(role="student")
    leaderboard = []

    for student in students:
        progress_rows = LessonProgress.objects.filter(user=student)
        total_xp = sum(p.xp for p in progress_rows)

        leaderboard.append({
            "username": student.username,
            "xp": total_xp,
            "age_group": student.age_group,
        })

    leaderboard = sorted(leaderboard, key=lambda x: x["xp"], reverse=True)
    return Response(leaderboard)


# --------------------------------------------------------
# 🟦 MI PERFIL
# --------------------------------------------------------
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


# ===================================================================
# 🟥🟥🟥 PARENT — CHILDREN (CON CAMBIO DE CONTRASEÑA CORRECTO) 🟥🟥🟥
# ===================================================================

# --------------------------------------------------------
# 🟦 LISTAR HIJOS
# --------------------------------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_children(request):
    parent = request.user
    children = CustomUser.objects.filter(linked_student=parent, role="student")

    result = []
    for child in children:
        result.append({
            "id": child.id,
            "username": child.username,
            "age": child.age,
            "password": "",
            "password_changed_once": child.password_changed_once,  # ← AGREGADO
        })

    return Response(result, status=200)



# --------------------------------------------------------
# 🟦 CREAR HIJO
# --------------------------------------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_child_api(request):
    parent = request.user
    username = request.data.get("username")
    age = request.data.get("age")

    if not username:
        return Response({"error": "Nombre de usuario obligatorio"}, status=400)

    if CustomUser.objects.filter(username=username).exists():
        return Response({"error": "Ese usuario ya existe"}, status=400)

    password = generate_secure_password()
    fake_email = f"{username.lower()}@child.cyberkids.local"

    child = CustomUser.objects.create_user(
        username=username,
        email=fake_email,
        password=password,
        role="student",
        age=age,
        linked_student=parent,
    )

    return Response({
        "message": "Hijo creado correctamente",
        "child_username": username,
        "child_password": password,
    }, status=201)


# --------------------------------------------------------
# 🟦 ACTUALIZAR HIJO (CON VALIDACIÓN DE CONTRASEÑA ANTERIOR)
# --------------------------------------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_child(request):
    child_id = request.data.get("child_id")

    try:
        child = CustomUser.objects.get(id=child_id, linked_student=request.user)
    except CustomUser.DoesNotExist:
        return Response({"error": "Hijo no encontrado."}, status=404)

    new_username = request.data.get("new_username")
    new_password = request.data.get("new_password")
    old_password = request.data.get("old_password")

    # 👉 Validación username duplicado
    if new_username:
        if CustomUser.objects.filter(username=new_username).exclude(id=child_id).exists():
            return Response({"error": "Este nombre de usuario ya está registrado."}, status=400)
        child.username = new_username

    # 👉 Validación de contraseña
    if new_password:

        # ❗ Si ya había cambiado antes → debe ingresar contraseña anterior correcta
        if child.password_changed_once:
            if not old_password:
                return Response({"error": "Debes ingresar la contraseña anterior."}, status=400)

            if not child.check_password(old_password):
                return Response({"error": "La contraseña anterior no es correcta."}, status=400)

        # Guardar nueva contraseña
        child.set_password(new_password)

        # Marcar que ahora ya cambió contraseña una vez
        child.password_changed_once = True

    child.save()

    return Response({"message": "Hijo actualizado correctamente."})
