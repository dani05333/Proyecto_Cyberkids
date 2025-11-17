from django.contrib.auth.models import AbstractUser
from django.db import models

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
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    age = models.PositiveIntegerField(null=True, blank=True)
    age_group = models.CharField(max_length=10, choices=AGE_GROUP_CHOICES, null=True, blank=True)  # 👈 nuevo campo

    linked_student = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='parent_link'
    )

    def __str__(self):
        return f"{self.username} ({self.role})"
