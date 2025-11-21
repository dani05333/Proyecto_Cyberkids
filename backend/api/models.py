from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


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

    email = models.EmailField(unique=True)

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student'
    )

    age = models.PositiveIntegerField(null=True, blank=True)

    age_group = models.CharField(
        max_length=10,
        choices=AGE_GROUP_CHOICES,
        null=True,
        blank=True
    )

    # Relación estudiante del apoderado
    linked_student = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='parent_link'
    )

    # 🆕 Nuevo campo: ¿ya cambió su contraseña alguna vez?
    password_changed_once = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.username} ({self.role})"


class LessonProgress(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='lesson_progress'
    )
    lesson_id = models.CharField(max_length=150)
    score = models.FloatField(default=0)     # 0–1, porcentaje o score
    time = models.FloatField(default=0)      # tiempo en segundos
    xp = models.IntegerField(default=0)      # experiencia ganada
    completed = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'lesson_id')

    def __str__(self):
        return f"{self.user.username} - {self.lesson_id}"
