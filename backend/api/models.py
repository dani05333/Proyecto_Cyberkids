from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Estudiante'),
        ('parent', 'Apoderado'),
        ('teacher', 'Docente/Colegio'),
        ('admin', 'Administrador'),
    ]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    age = models.PositiveIntegerField(null=True, blank=True)

    linked_student = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='parent_link'
    )

    def __str__(self):
        return f"{self.username} ({self.role})"
