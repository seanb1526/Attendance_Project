import uuid
from django.db import models

class School(models.Model):
    name = models.CharField(max_length=255, unique=True)
    faculty_domain = models.CharField(max_length=255)
    student_domain = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Faculty(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    email_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Student(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    student_id = models.CharField(max_length=50, unique=True)
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    email_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

# New model for students added by faculty but not yet registered
class PendingStudent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    student_id = models.CharField(max_length=50)
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    added_by = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'student_id')  # Student IDs must be unique within a school

    def __str__(self):
        return f"{self.first_name} {self.last_name} (Pending)"

class Class(models.Model):
    name = models.CharField(max_length=255)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    semester = models.CharField(max_length=100, blank=True, null=True)  # New field for semester information

    def __str__(self):
        return self.name

class ClassStudent(models.Model):
    class_instance = models.ForeignKey(Class, on_delete=models.CASCADE, related_name="students")
    student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True)
    pending_student = models.ForeignKey(PendingStudent, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        unique_together = (('class_instance', 'student'), ('class_instance', 'pending_student'))
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(student__isnull=False, pending_student__isnull=True) | 
                    models.Q(student__isnull=True, pending_student__isnull=False)
                ),
                name='one_student_type_only'
            )
        ]

class Event(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    date = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)  # New field for event end time
    location = models.CharField(max_length=255, blank=True, null=True)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    checkin_before_minutes = models.IntegerField(default=15)
    checkin_after_minutes = models.IntegerField(default=15)

    def __str__(self):
        return self.name

class ClassEvent(models.Model):
    class_instance = models.ForeignKey(Class, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('class_instance', 'event')

class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    scanned_at = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=500, null=True, blank=True)
    device_id = models.CharField(max_length=255, null=True, blank=True)  # New field for device identification

    class Meta:
        unique_together = ('student', 'event')

# Admin user model - new
class Admin(models.Model):
    ADMIN_ROLES = (
        ('master', 'Master Admin'),
        ('co', 'Co-Administrator'),
        ('sub', 'University Admin'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role = models.CharField(max_length=10, choices=ADMIN_ROLES, default='sub')
    school = models.ForeignKey(School, on_delete=models.SET_NULL, null=True, blank=True)
    password_hash = models.CharField(max_length=255)  # Hashed password for direct login
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.get_role_display()})"
