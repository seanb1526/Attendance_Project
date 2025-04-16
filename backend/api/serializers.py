from rest_framework import serializers
from .models import School, Student, Faculty, Event, Class, Attendance, PendingStudent, ClassStudent, ClassEvent, Admin

# ---------------- School Serializer ----------------
class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ['id', 'name', 'faculty_domain', 'student_domain']

# ---------------- Student Serializer ----------------
class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'student_id', 'first_name', 'last_name', 'email', 'email_verified', 'school']

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
        fields = ['id', 'name', 'description', 'date', 'end_time', 'location', 'faculty', 'school', 
                 'checkin_before_minutes', 'checkin_after_minutes']

# ---------------- Pending Student Serializer ----------------
class PendingStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PendingStudent
        fields = ['id', 'first_name', 'last_name', 'email', 'student_id', 'school', 'added_by', 'created_at']
        read_only_fields = ['id', 'created_at']

# ---------------- Class Student Serializer ----------------
class ClassStudentSerializer(serializers.ModelSerializer):
    student_info = serializers.SerializerMethodField()
    
    class Meta:
        model = ClassStudent
        fields = ['id', 'class_instance', 'student', 'pending_student', 'student_info']
        
    def get_student_info(self, obj):
        if obj.student:
            return {
                'id': str(obj.student.id),
                'first_name': obj.student.first_name,
                'last_name': obj.student.last_name,
                'email': obj.student.email,
                'student_id': obj.student.student_id,
                'registered': True
            }
        elif obj.pending_student:
            return {
                'id': str(obj.pending_student.id),
                'first_name': obj.pending_student.first_name,
                'last_name': obj.pending_student.last_name,
                'email': obj.pending_student.email,
                'student_id': obj.pending_student.student_id,
                'registered': False
            }
        return None

# ---------------- Class Serializer ----------------
class ClassSerializer(serializers.ModelSerializer):    
    students = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = ['id', 'name', 'faculty', 'school', 'students', 'semester']
        
    def get_students(self, obj):
        # Get all ClassStudent associations for this class
        class_students = ClassStudent.objects.filter(class_instance=obj)
        student_ids = []
        
        # Include both regular students and pending students
        for cs in class_students:
            if cs.student:
                student_ids.append(str(cs.student.id))
            elif cs.pending_student:
                student_ids.append(str(cs.pending_student.id))
        
        # Debug output to see what IDs we're returning
        print(f"Class {obj.id} has students: {student_ids}")
        return student_ids

# ---------------- Attendance Serializer ----------------
class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ['id', 'student', 'event', 'scanned_at', 'location', 'device_id']

# ---------------- Class Event Serializer ----------------
class ClassEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassEvent
        fields = ['id', 'class_instance', 'event']

# ---------------- Admin Serializers ----------------
class AdminSerializer(serializers.ModelSerializer):
    school_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Admin
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'school', 'school_name', 'created_at', 'last_login']
        read_only_fields = ['id', 'created_at', 'last_login']
        
    def get_school_name(self, obj):
        if obj.school:
            return obj.school.name
        return None

class AdminRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = Admin
        fields = ['email', 'first_name', 'last_name', 'password', 'role', 'school']
        
    def validate_email(self, value):
        if Admin.objects.filter(email=value).exists():
            raise serializers.ValidationError("An administrator with this email already exists")
        return value
