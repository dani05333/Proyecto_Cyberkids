from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

# ------------------------------------------------------------
# 👤 USUARIO PERSONALIZADO (CustomUser)
# ------------------------------------------------------------
class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Estudiante'),
        ('parent', 'Apoderado'),
        ('teacher', 'Docente/Colegio'),
        ('admin', 'Administrador'),
    ]

    AGE_GROUP_CHOICES = [
        ('KID', 'Niño (6-9 años)'),
        ('TWEEN', 'Preadolescente (10-12 años)'),
        ('TEEN', 'Adolescente (13-16 años)'),
    ]

    # Email único
    email = models.EmailField(unique=True)

    # Rol del usuario
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student'
    )

    # Edad y grupo etario
    age = models.PositiveIntegerField(null=True, blank=True)
    age_group = models.CharField(
        max_length=10,
        choices=AGE_GROUP_CHOICES,
        null=True,
        blank=True
    )

    # Relación apoderado → estudiante
    linked_student = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='parent_link'
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

    def __str__(self):
        return f"{self.username} ({self.role})"


# ------------------------------------------------------------
# 📘 PROGRESO DE LECCIONES (1 sola vez por lección)
# ------------------------------------------------------------
class LessonProgress(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='lesson_progress'
    )
    lesson_id = models.CharField(max_length=150)
    score = models.FloatField(default=0)       # 0–1
    time = models.FloatField(default=0)        # segundos
    xp = models.IntegerField(default=0)        # experiencia
    completed = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'lesson_id')

    def __str__(self):
        return f"{self.user.username} - {self.lesson_id}"
