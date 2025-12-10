from django.contrib import admin
from django.urls import path

from api.views import (
    # 🔐 Auth
    RegisterView,
    EmailTokenObtainPairView,
    send_verification_code,
    verify_email,

    # 👦 Estudiantes / progreso / perfil
    get_student_by_username,
    set_student_age_group,
    get_my_progress,
    update_lesson_progress,
    get_leaderboard,
    get_me,

    # 👪 Padres e hijos
    list_children,
    create_child_api,
    update_child,
    get_child_progress_for_parent,
    archive_child,

    # 🟥 ADMIN CRUD + REPORTES
    admin_list_users,
    admin_update_user,
    admin_report_overview,
    admin_report_export,

    # 👨‍🏫 DOCENTE — CURSOS
    teacher_list_courses,
    teacher_course_detail,
    teacher_add_student_to_course,
    teacher_remove_student_from_course,  # 🔹 nuevo import
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # ---------------------------
    # 🔐 Auth
    # ---------------------------
    path("api/register/", RegisterView.as_view(), name="register"),
    path("api/login/", EmailTokenObtainPairView.as_view(), name="login"),

    # ---------------------------
    # 🔏 Verificación de correo
    # ---------------------------
    path(
        "api/send-verification-code/",
        send_verification_code,
        name="send_verification_code",
    ),
    path("api/verify-email/", verify_email, name="verify_email"),

    # ---------------------------
    # 👦 Estudiantes
    # ---------------------------
    path(
        "api/student/set-age-group/",
        set_student_age_group,
        name="set_age_group",
    ),
    path(
        "api/student/<str:username>/",
        get_student_by_username,
        name="get_student",
    ),

    # ---------------------------
    # 🧩 Progreso de lecciones
    # ---------------------------
    path("api/progress/", get_my_progress, name="get_progress"),
    path("api/progress/update/", update_lesson_progress, name="update_progress"),

    # ---------------------------
    # 🏆 Ranking
    # ---------------------------
    path("api/leaderboard/", get_leaderboard, name="leaderboard"),

    # ---------------------------
    # 👤 Mi perfil
    # ---------------------------
    path("api/me/", get_me, name="me"),

    # ---------------------------
    # 👪 Padres e hijos
    # ---------------------------
    path(
        "api/parent/children/",
        list_children,
        name="list_children",
    ),
    path(
        "api/parent/create-child/",
        create_child_api,
        name="create_child",
    ),
    path(
        "api/parent/update-child/",
        update_child,
        name="update_child",
    ),
    path(
        "api/parent/children/<int:child_id>/progress/",
        get_child_progress_for_parent,
        name="child_progress_for_parent",
    ),
    path(
        "api/parent/archive-child/",
        archive_child,
        name="archive_child",
    ),

    # ---------------------------
    # 🟥 ADMIN — CRUD COMPLETO
    # ---------------------------
    path(
        "api/admin/users/",
        admin_list_users,
        name="admin_list_users",
    ),
    path(
        "api/admin/users/<int:user_id>/",
        admin_update_user,
        name="admin_update_user",
    ),

    # ---------------------------
    # 🟥 ADMIN — REPORTES
    # ---------------------------

    # JSON para tarjetas / gráficos
    path(
        "api/admin/report/overview/",
        admin_report_overview,
        name="admin_report_overview",
    ),

    # Exportar reporte
    path(
        "api/admin/export-report/",
        admin_report_export,
        name="admin_report_export",
    ),

    # Alias por si en algún lado quedó la versión antigua
    path(
        "api/admin/report/export/",
        admin_report_export,
        name="admin_report_export_legacy",
    ),

    # ---------------------------
    # 👨‍🏫 DOCENTE — CURSOS
    # ---------------------------
    path(
        "api/teacher/courses/",
        teacher_list_courses,
        name="teacher_list_courses",
    ),
    path(
        "api/teacher/courses/<int:course_id>/",
        teacher_course_detail,
        name="teacher_course_detail",
    ),
    path(
        "api/teacher/courses/<int:course_id>/add-student/",
        teacher_add_student_to_course,
        name="teacher_add_student_to_course",
    ),
    path(
        "api/teacher/courses/<int:course_id>/remove-student/",
        teacher_remove_student_from_course,
        name="teacher_remove_student_from_course",
    ),
]
