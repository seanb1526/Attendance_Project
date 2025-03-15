from rest_framework import serializers
from .models import School, Student

class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ['id', 'name', 'email_domain']

class StudentRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['student_id', 'first_name', 'last_name', 'email', 'school']
        
    def validate_email(self, value):
        school = self.initial_data.get('school')
        try:
            school_obj = School.objects.get(id=school)
            if not value.endswith(f'@{school_obj.email_domain}'):
                raise serializers.ValidationError(
                    f"Please use your school email address ending with @{school_obj.email_domain}"
                )
        except School.DoesNotExist:
            raise serializers.ValidationError("Invalid school selected")
        return value 