from django.contrib import admin
from django.urls import path

from api.views import (
    RegisterView,
    EmailTokenObtainPairView,
    get_student_by_username,
    set_student_age_group,
    get_my_progress,
    update_lesson_progress,
    get_leaderboard,
    get_me,
    list_children,
    create_child_api,
    update_child,
    send_verification_code,   # ✅ verificación
    verify_email,             # ✅ verificación
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # ---------------------------
    # 🔐 Auth
    # ---------------------------
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', EmailTokenObtainPairView.as_view(), name='login'),

    # ---------------------------
    # 🔏 Verificación de correo
    # ---------------------------
    path('api/send-verification-code/', send_verification_code, name='send_verification_code'),
    path('api/verify-email/', verify_email, name='verify_email'),

    # ---------------------------
    # 👦 Estudiantes
    # ---------------------------
    path('api/student/set-age-group/', set_student_age_group, name='set_age_group'),
    path('api/student/<str:username>/', get_student_by_username, name='get_student'),

    # ---------------------------
    # 🧩 Progreso de lecciones
    # ---------------------------
    path('api/progress/', get_my_progress, name='get_progress'),
    path('api/progress/update/', update_lesson_progress, name='update_progress'),

    # ---------------------------
    # 🏆 Ranking
    # ---------------------------
    path('api/leaderboard/', get_leaderboard, name='leaderboard'),

    # ---------------------------
    # 👤 Mi perfil
    # ---------------------------
    path('api/me/', get_me, name='me'),

    # ---------------------------
    # 👪 Padres e hijos
    # ---------------------------
    path('api/parent/children/', list_children, name='list_children'),
    path('api/parent/create-child/', create_child_api, name='create_child'),
    path('api/parent/update-child/', update_child, name='update_child'),
]
