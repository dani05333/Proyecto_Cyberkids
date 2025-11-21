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
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # 🔹 Rutas estáticas primero
    path('api/student/set-age-group/', set_student_age_group),
    path('api/student/<str:username>/', get_student_by_username),

    # 🔹 Auth
    path('api/register/', RegisterView.as_view()),
    path('api/login/', EmailTokenObtainPairView.as_view()),

    # 🔹 Progreso
    path('api/progress/', get_my_progress),
    path('api/progress/update/', update_lesson_progress),

    # 🔹 Leaderboard
    path('api/leaderboard/', get_leaderboard),

    # 🔹 Mi cuenta
    path('api/me/', get_me),

    # 🔹 Padres
    path('api/parent/children/', list_children),
    path('api/parent/create-child/', create_child_api),
    path('api/parent/update-child/', update_child),
]
