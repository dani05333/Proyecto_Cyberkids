from datetime import date

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


# ------------------------------------------------------------
# 👤 USUARIO PERSONALIZADO (CustomUser)
# ------------------------------------------------------------
class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ("student", "Estudiante"),
        ("parent", "Apoderado"),
        ("teacher", "Docente"),
        ("school", "Colegio"),
        ("admin", "Administrador"),
    ]

    AGE_GROUP_CHOICES = [
        ("KID", "Niño (6-9 años)"),
        ("TWEEN", "Preadolescente (10-12 años)"),
        ("TEEN", "Adolescente (13-16 años)"),
    ]

    # Email único
    email = models.EmailField(unique=True)

    # Rol del usuario
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="student",
    )

    # 🔹 Fecha de nacimiento (para adultos y estudiantes)
    date_of_birth = models.DateField(null=True, blank=True)

    # Edad (se calculará automáticamente desde date_of_birth)
    age = models.PositiveIntegerField(null=True, blank=True)

    # Grupo etario (para estudiantes)
    age_group = models.CharField(
        max_length=10,
        choices=AGE_GROUP_CHOICES,
        null=True,
        blank=True,
    )

    # Relación apoderado → estudiante
    # (En tus vistas usas linked_student en el niño apuntando al apoderado)
    linked_student = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="parent_link",
    )

    # Bandera de cambio de contraseña (niños)
    password_changed_once = models.BooleanField(default=False)

    # ------------------------------------------------------------
    # 📧 VERIFICACIÓN DE CORREO
    # ------------------------------------------------------------
    email_verified = models.BooleanField(default=False)
    verification_code = models.CharField(max_length=6, null=True, blank=True)
    verification_code_expires_at = models.DateTimeField(null=True, blank=True)

    # ------------------------------------------------------------
    # 🗑️ ARCHIVADO (Soft Delete)
    # ------------------------------------------------------------
    is_archived = models.BooleanField(default=False)

    # ------------------------------------------------------------
    # 🧮 Cálculo de edad
    # ------------------------------------------------------------
    def calculate_age(self):
        if not self.date_of_birth:
            return None
        today = date.today()
        years = today.year - self.date_of_birth.year
        # ajustar si aún no cumple años este año
        if (today.month, today.day) < (
            self.date_of_birth.month,
            self.date_of_birth.day,
        ):
            years -= 1
        return years

    def save(self, *args, **kwargs):
        # si hay fecha de nacimiento, recalculamos edad antes de guardar
        if self.date_of_birth:
            self.age = self.calculate_age()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.role})"


# ------------------------------------------------------------
# 📘 PROGRESO DE LECCIONES (1 sola vez por lección)
# ------------------------------------------------------------
class LessonProgress(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="lesson_progress",
    )
    lesson_id = models.CharField(max_length=150)
    score = models.FloatField(default=0)  # 0–1
    time = models.FloatField(default=0)  # segundos
    xp = models.IntegerField(default=0)  # experiencia
    completed = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "lesson_id")

    def __str__(self):
        return f"{self.user.username} - {self.lesson_id}"


# ------------------------------------------------------------
# 🧑‍🏫 CURSOS (para perfil Docente)
# ------------------------------------------------------------
class Course(models.Model):
    """
    Curso / sección que maneja un docente.
    Cada curso tiene un teacher (usuario role='teacher')
    y una lista de alumnos (students).
    """

    name = models.CharField(max_length=100)
    grade = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="Nivel o curso, ej: 5° básico, 1° medio...",
    )

    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="courses_taught",
    )

    students = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="courses_enrolled",
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.teacher.username}"
