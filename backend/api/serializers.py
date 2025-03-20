from rest_framework import serializers
from .models import School, Student, Faculty, Event, Class, Attendance, ClassStudent

# ---------------- School Serializer ----------------
class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ['id', 'name', 'faculty_domain', 'student_domain']

# ---------------- Student Serializer ----------------
class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'student_id', 'first_name', 'last_name', 'email', 'school']

# ---------------- Student Registration Serializer ----------------
class StudentRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['student_id', 'first_name', 'last_name', 'email', 'school']
        
    def validate_email(self, value):
        school_id = self.initial_data.get('school')
        try:
            school_obj = School.objects.get(id=school_id)
            if not value.endswith(f'@{school_obj.student_domain}'):
                raise serializers.ValidationError(
                    f"Please use your school email address ending with @{school_obj.student_domain}"
                )
        except School.DoesNotExist:
            raise serializers.ValidationError("Invalid school selected")
        return value 

# ---------------- Faculty Serializer ----------------
class FacultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = ['first_name', 'last_name', 'email', 'school']

    def validate_email(self, value):
        school_id = self.initial_data.get('school')
        try:
            school_obj = School.objects.get(id=school_id)
            if not value.endswith(f'@{school_obj.email_domain}'):
                raise serializers.ValidationError(
                    f"Please use your faculty email address ending with @{school_obj.email_domain}"
                )
        except School.DoesNotExist:
            raise serializers.ValidationError("Invalid school selected")
        return value

# ---------------- Faculty Registration Serializer ----------------
class FacultyRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = ['first_name', 'last_name', 'email', 'school']
        
    def validate_email(self, value):
        school_id = self.initial_data.get('school')
        try:
            school_obj = School.objects.get(id=school_id)
            if not value.endswith(f'@{school_obj.faculty_domain}'):
                raise serializers.ValidationError(
                    f"Please use your faculty email address ending with @{school_obj.faculty_domain}"
                )
        except School.DoesNotExist:
            raise serializers.ValidationError("Invalid school selected")
        return value

# ---------------- Event Serializer ----------------
class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'name', 'date', 'location', 'qr_code']

# ---------------- Class Serializer ----------------
class ClassSerializer(serializers.ModelSerializer):
    students = serializers.SerializerMethodField()
    
    class Meta:
        model = Class
        fields = ['id', 'name', 'faculty', 'school', 'students']
        
    def get_students(self, obj):
        class_students = ClassStudent.objects.filter(class_instance=obj)
        student_ids = [cs.student.id for cs in class_students]
        return student_ids

# ---------------- Attendance Serializer ----------------
class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ['id', 'student', 'event', 'timestamp']
