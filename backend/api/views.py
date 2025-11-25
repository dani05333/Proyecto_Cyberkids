from rest_framework import generics, status, serializers
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings

from datetime import timedelta
import secrets

from .serializers import (
    UserRegisterSerializer,
    LessonProgressSerializer,
    generate_secure_password,
)

from .models import CustomUser, LessonProgress

User = get_user_model()


# ========================================================
# 🔐 HELPER: generar y enviar código de verificación
# ========================================================
def _generate_and_send_verification_code(user: CustomUser):
    """
    Genera un código de 6 dígitos, lo guarda con expiración
    y lo envía al usuario por correo.
    """
    code = f"{secrets.randbelow(1000000):06d}"

    user.verification_code = code
    user.verification_code_expires_at = timezone.now() + timedelta(minutes=15)
    user.save(update_fields=["verification_code", "verification_code_expires_at"])

    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@cyberkids.cl")

    send_mail(
        subject="Código de verificación - CyberKids Chile",
        message=(
            f"Hola {user.username},\n\n"
            f"Tu código de verificación es: {code}\n"
            f"Este código expira en 15 minutos.\n\n"
            f"Equipo CyberKids Chile"
        ),
        from_email=from_email,
        recipient_list=[user.email],
        fail_silently=False,
    )


# ========================================================
# 🟦 REGISTRO
# ========================================================
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Solo ADULTOS deben verificar
            if user.role in ["parent", "teacher", "admin"]:
                _generate_and_send_verification_code(user)

            child_password = getattr(user, "generated_child_password", None)

            return Response({
                "message": "Usuario creado correctamente. Revisa tu correo para verificar la cuenta.",
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "child_password": child_password,
            }, status=201)

        return Response(serializer.errors, status=400)


# ========================================================
# 🟦 LOGIN (con bloqueo por falta de verificación y archivado)
# ========================================================
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get("username")
        password = attrs.get("password")
        expected_role = self.context['request'].data.get("expected_role")

        # Permite usar email como username
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

        # 🚫 Bloqueo si el usuario fue archivado (soft delete)
        if getattr(user, "is_archived", False):
            raise serializers.ValidationError(
                "Esta cuenta ha sido desactivada por el apoderado."
            )

        # ❗ Bloqueo si NO ha verificado (adultos)
        if user.role in ["parent", "teacher", "admin"] and not user.email_verified:
            raise serializers.ValidationError(
                "Debes verificar tu correo antes de iniciar sesión."
            )

        if expected_role and user.role != expected_role:
            raise serializers.ValidationError(
                f"No tienes permisos para ingresar como {expected_role}."
            )

        data = super().validate(attrs)
        data["username"] = user.username
        data["role"] = user.role
        return data


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


# ========================================================
# 🟦 ENVIAR / REENVIAR CÓDIGO DE VERIFICACIÓN
# ========================================================
@api_view(["POST"])
@permission_classes([AllowAny])
def send_verification_code(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "Debes enviar el correo."}, status=400)

    email = email.lower().strip()

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "No existe un usuario con este correo."}, status=404)

    if user.email_verified:
        return Response({"message": "Este correo ya está verificado."}, status=200)

    _generate_and_send_verification_code(user)

    return Response({"message": "Código de verificación enviado."}, status=200)


# ========================================================
# 🟦 VERIFICAR CORREO
# ========================================================
@api_view(["POST"])
@permission_classes([AllowAny])
def verify_email(request):
    email = request.data.get("email")
    code = request.data.get("code")

    if not email or not code:
        return Response({"error": "Debes enviar correo y código."}, status=400)

    email = email.lower().strip()

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "No existe un usuario con este correo."}, status=404)

    if user.email_verified:
        return Response({"message": "El correo ya está verificado."}, status=200)

    # Validar código existente
    if not user.verification_code:
        return Response({"error": "No hay código activo. Solicita uno nuevo."}, status=400)

    if timezone.now() > user.verification_code_expires_at:
        return Response({"error": "El código ha expirado."}, status=400)

    if code != user.verification_code:
        return Response({"error": "Código incorrecto."}, status=400)

    # Marcar como verificado
    user.email_verified = True
    user.verification_code = None
    user.verification_code_expires_at = None
    user.save(update_fields=[
        "email_verified", "verification_code", "verification_code_expires_at"
    ])

    return Response({"message": "Correo verificado correctamente."}, status=200)


# ========================================================
# 🟦 OBTENER ESTUDIANTE POR USERNAME
#   (Excluye alumnos archivados)
# ========================================================
@api_view(['GET'])
def get_student_by_username(request, username):
    try:
        student = CustomUser.objects.get(
            username=username,
            role="student",
            is_archived=False
        )
    except CustomUser.DoesNotExist:
        return Response({"error": "Estudiante no encontrado"}, status=404)

    return Response({
        "id": student.id,
        "username": student.username,
        "email": student.email,
        "linked_parent": student.linked_student.username if student.linked_student else None,
        "age_group": student.age_group,
        "age": student.age,
    })


# ========================================================
# 🟦 SET AGE GROUP
# ========================================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_student_age_group(request):
    username = request.data.get("username")
    age_group = request.data.get("age_group")

    if not username or not age_group:
        return Response({"error": "Faltan campos"}, status=400)

    try:
        student = CustomUser.objects.get(
            username=username,
            role="student",
            is_archived=False
        )
    except CustomUser.DoesNotExist:
        return Response({"error": "Estudiante no encontrado"}, status=404)

    student.age_group = age_group
    student.save()
    return Response({"message": "Grupo de edad actualizado correctamente"})


# ========================================================
# 🟦 PROGRESO
# ========================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_progress(request):
    progress = LessonProgress.objects.filter(user=request.user)
    return Response(LessonProgressSerializer(progress, many=True).data)


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

    return Response(LessonProgressSerializer(progress).data)


# ========================================================
# 🟦 LEADERBOARD (ignora alumnos archivados)
# ========================================================
@api_view(["GET"])
def get_leaderboard(request):
    leaderboard = []

    for student in CustomUser.objects.filter(role="student", is_archived=False):
        total_xp = sum(p.xp for p in LessonProgress.objects.filter(user=student))
        leaderboard.append({
            "username": student.username,
            "xp": total_xp,
            "age_group": student.age_group,
        })

    leaderboard.sort(key=lambda x: x["xp"], reverse=True)

    return Response(leaderboard)


# ========================================================
# 🟦 MI PERFIL
# ========================================================
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


# ========================================================
# 🟥 PADRES — GESTIÓN DE HIJOS
# ========================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_children(request):
    parent = request.user
    children = CustomUser.objects.filter(
        linked_student=parent,
        role="student",
        is_archived=False
    )

    return Response([
        {
            "id": c.id,
            "username": c.username,
            "age": c.age,
            "age_group": c.age_group,
            "password": "",
            "password_changed_once": c.password_changed_once,
        }
        for c in children
    ])


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
    fake_email = f"{username.lower()}@child.cyberkids.cl"

    CustomUser.objects.create_user(
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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_child(request):
    child_id = request.data.get("child_id")

    try:
        child = CustomUser.objects.get(
            id=child_id,
            linked_student=request.user,
            role="student",
            is_archived=False
        )
    except CustomUser.DoesNotExist:
        return Response({"error": "Hijo no encontrado."}, status=404)

    new_username = request.data.get("new_username")
    new_password = request.data.get("new_password")
    old_password = request.data.get("old_password")

    # Validar username duplicado
    if new_username:
        if CustomUser.objects.filter(username=new_username).exclude(id=child_id).exists():
            return Response({"error": "Nombre de usuario ya registrado."}, status=400)
        child.username = new_username

    # Cambiar contraseña
    if new_password:

        if child.password_changed_once:
            if not old_password:
                return Response({"error": "Debes ingresar la contraseña anterior."}, status=400)

            if not child.check_password(old_password):
                return Response({"error": "La contraseña anterior no es correcta."}, status=400)

        child.set_password(new_password)
        child.password_changed_once = True

    child.save()

    return Response({"message": "Hijo actualizado correctamente."})


# ========================================================
# 🟥 PADRES — ARCHIVAR (soft delete) HIJO
# ========================================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def archive_child(request):
    child_id = request.data.get("child_id")

    if not child_id:
        return Response({"error": "child_id requerido."}, status=400)

    try:
        child = CustomUser.objects.get(
            id=child_id,
            linked_student=request.user,
            role="student",
            is_archived=False
        )
    except CustomUser.DoesNotExist:
        return Response({"error": "Hijo no encontrado."}, status=404)

    child.is_archived = True
    child.save(update_fields=["is_archived"])

    return Response({"message": "Alumno archivado correctamente."})


# ========================================================
# 🟥 PADRES — PROGRESO ESPECÍFICO DE UN HIJO
#   (ignora archivados)
# ========================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_child_progress_for_parent(request, child_id):
    parent = request.user
    try:
        child = CustomUser.objects.get(
            id=child_id,
            linked_student=parent,
            role="student",
            is_archived=False
        )
    except CustomUser.DoesNotExist:
        return Response(
            {"error": "Hijo no encontrado o no pertenece a este apoderado."},
            status=404
        )

    progress_qs = LessonProgress.objects.filter(user=child)
    progress_serializer = LessonProgressSerializer(progress_qs, many=True)

    return Response({
        "id": child.id,
        "username": child.username,
        "age_group": child.age_group,
        "age": child.age,
        "progress": progress_serializer.data,
    })

# ========================================================
# 🟥 ADMIN — LISTAR TODOS LOS USUARIOS
# ========================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_list_users(request):
    # solo admins
    if request.user.role != "admin":
        return Response({"error": "No autorizado"}, status=403)

    # query params
    only_active = request.query_params.get("only_active", "true").lower() == "true"
    page = int(request.query_params.get("page", 1))
    page_size = int(request.query_params.get("page_size", 20))

    qs = CustomUser.objects.all().order_by("-date_joined")

    if only_active:
        qs = qs.filter(is_archived=False)

    total = qs.count()
    start = (page - 1) * page_size
    end = start + page_size
    qs = qs[start:end]

    data = [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "age": u.age,
            "age_group": u.age_group,
            "linked_student_username": (
                u.linked_student.username if u.linked_student else None
            ),
            "is_archived": u.is_archived,
            "date_joined": u.date_joined,
            "last_login": u.last_login,
        }
        for u in qs
    ]

    return Response(
        {
            "results": data,
            "page": page,
            "page_size": page_size,
            "total": total,
        }
    )