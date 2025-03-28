from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import School, Student, Faculty, Event, Class, Attendance
from .serializers import SchoolSerializer, StudentRegistrationSerializer, FacultySerializer, EventSerializer, ClassSerializer, AttendanceSerializer, FacultyRegistrationSerializer
from django.conf import settings
import jwt
from datetime import datetime, timedelta
import traceback
from django.core.mail import send_mail

# ---------------- School ViewSet ----------------
class SchoolViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer

# ---------------- Student ViewSet ----------------
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentRegistrationSerializer

# ---------------- Register Student ----------------
@api_view(['POST'])
def register_student(request):
    serializer = StudentRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        try:
            student = serializer.save(email_verified=False)
            token = jwt.encode({
                'student_id': str(student.id),
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, settings.SECRET_KEY, algorithm='HS256')

            verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"

            html_message = f"""
            <h3>Welcome to ClassAttend!</h3>
            <p>Thank you for registering. Please click the button below to verify your email address:</p>
            <p><a href="{verification_url}" style="background-color: #DEA514; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p>{verification_url}</p>
            """
            
            send_mail(
                subject="Verify your ClassAttend account",
                message=f"Welcome to ClassAttend! Click the following link to verify your email: {verification_url}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[student.email],
                html_message=html_message,
                fail_silently=False,
            )

            return Response({
                'message': 'Registration successful. Please check your email to verify your account.'
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            traceback.print_exc()
            return Response({
                'error': f'Registration error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ---------------- Verify Email ----------------
@api_view(['GET'])
def verify_email(request):
    token = request.GET.get('token')
    user_type = request.GET.get('type', 'student')  # Default to student for backward compatibility
    
    if not token:
        return Response({'error': 'No verification token provided'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        
        if user_type == 'faculty':
            faculty_id = payload.get('faculty_id')
            if not faculty_id:
                raise jwt.InvalidTokenError('Invalid faculty token')
            user = Faculty.objects.get(id=faculty_id)
        else:
            student_id = payload.get('student_id')
            if not student_id:
                raise jwt.InvalidTokenError('Invalid student token')
            user = Student.objects.get(id=student_id)

        user.email_verified = True
        user.save()

        return Response({'message': 'Email verified successfully'})
    except jwt.ExpiredSignatureError:
        return Response({'error': 'Verification link has expired'}, status=status.HTTP_400_BAD_REQUEST)
    except jwt.InvalidTokenError:
        return Response({'error': 'Invalid verification token'}, status=status.HTTP_400_BAD_REQUEST)
    except (Student.DoesNotExist, Faculty.DoesNotExist):
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ---------------- Student Sign In ----------------
@api_view(['POST'])
def student_signin(request):
    email = request.data.get('email')
    student_id = request.data.get('student_id')

    try:
        student = Student.objects.get(email=email)
        
        if student.student_id != student_id:
            return Response({'error': 'Invalid student ID'}, status=status.HTTP_400_BAD_REQUEST)

        token = jwt.encode({
            'student_id': str(student.id),
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, settings.SECRET_KEY, algorithm='HS256')

        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"

        html_message = f"""
        <h3>Sign In to ClassAttend</h3>
        <p>Click the button below to sign in to your account:</p>
        <p><a href="{verification_url}" style="background-color: #DEA514; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Sign In</a></p>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p>{verification_url}</p>
        """

        send_mail(
            subject="Sign in to ClassAttend",
            message=f"Click the following link to sign in: {verification_url}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[student.email],
            html_message=html_message,
            fail_silently=False,
        )

        return Response({'message': 'Please check your email for the sign in link.'})

    except Student.DoesNotExist:
        return Response({'error': 'No account found with this email'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        traceback.print_exc()
        return Response({'error': 'An error occurred during sign in'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ---------------- Faculty ViewSet ----------------
class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer

# ---------------- Event ViewSet ----------------
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

# ---------------- Class ViewSet ----------------
class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer

# ---------------- Attendance ViewSet ----------------
class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

# ---------------- Register Faculty ----------------
@api_view(['POST'])
def register_faculty(request):
    serializer = FacultyRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        try:
            faculty = serializer.save(email_verified=False)
            token = jwt.encode({
                'faculty_id': str(faculty.id),
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, settings.SECRET_KEY, algorithm='HS256')

            verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}&type=faculty"

            html_message = f"""
            <h3>Welcome to ClassAttend!</h3>
            <p>Thank you for registering as faculty. Please click the button below to verify your email address:</p>
            <p><a href="{verification_url}" style="background-color: #DEA514; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p>{verification_url}</p>
            """
            
            send_mail(
                subject="Verify your ClassAttend Faculty Account",
                message=f"Welcome to ClassAttend! Click the following link to verify your email: {verification_url}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[faculty.email],
                html_message=html_message,
                fail_silently=False,
            )

            return Response({
                'message': 'Registration successful. Please check your email to verify your account.'
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            traceback.print_exc()
            return Response({
                'error': f'Registration error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ---------------- Faculty SignIn ----------------
@api_view(['POST'])
def faculty_signin(request):
    email = request.data.get('email')
    
    try:
        faculty = Faculty.objects.get(email=email)
        
        if not faculty.email_verified:
            return Response({
                'error': 'Please verify your email address first'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Generate authentication token
        token = jwt.encode({
            'faculty_id': str(faculty.id),
            'exp': datetime.utcnow() + timedelta(days=1)  # Token expires in 24 hours
        }, settings.SECRET_KEY, algorithm='HS256')

        # Send signin link via email
        signin_url = f"{settings.FRONTEND_URL}/verify-email?token={token}&type=faculty"
        
        html_message = f"""
        <h3>Faculty Sign In</h3>
        <p>Click the button below to sign in to your ClassAttend account:</p>
        <p><a href="{signin_url}" style="background-color: #DEA514; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Sign In</a></p>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p>{signin_url}</p>
        """

        send_mail(
            subject="ClassAttend Faculty Sign In Link",
            message=f"Click the following link to sign in: {signin_url}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[faculty.email],
            html_message=html_message,
            fail_silently=False,
        )

        return Response({
            'message': 'Please check your email for the sign-in link.'
        })

    except Faculty.DoesNotExist:
        return Response({
            'error': 'No faculty account found with this email address'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        traceback.print_exc()
        return Response({
            'error': f'Sign in error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
