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

class Class(models.Model):
    name = models.CharField(max_length=255)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    semester = models.CharField(max_length=100, blank=True, null=True)  # New field for semester information

    def __str__(self):
        return self.name

class ClassStudent(models.Model):
    class_instance = models.ForeignKey(Class, on_delete=models.CASCADE, related_name="students")
    student = models.ForeignKey(Student, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('class_instance', 'student')

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
