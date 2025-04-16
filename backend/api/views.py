from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import School, Student, Faculty, Event, Class, Attendance, ClassStudent, ClassEvent, PendingStudent, Admin
from .serializers import SchoolSerializer, StudentRegistrationSerializer, FacultySerializer, EventSerializer, ClassSerializer, AttendanceSerializer, FacultyRegistrationSerializer, ClassEventSerializer, StudentSerializer, PendingStudentSerializer, ClassStudentSerializer, AdminSerializer, AdminRegistrationSerializer
from django.conf import settings
import jwt
from datetime import datetime, timedelta
import traceback
from django.core.mail import send_mail
from rest_framework.exceptions import PermissionDenied
import qrcode
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from django.http import HttpResponse
from uuid import UUID
from PIL import Image
from django.contrib.auth.hashers import make_password, check_password

# ---------------- School ViewSet ----------------
class SchoolViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer

# ---------------- Student ViewSet ----------------
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

# ---------------- Pending Student ViewSet ----------------
class PendingStudentViewSet(viewsets.ModelViewSet):
    queryset = PendingStudent.objects.all()
    serializer_class = PendingStudentSerializer
    
    def get_queryset(self):
        queryset = PendingStudent.objects.all()
        faculty_id = self.request.query_params.get('faculty', None)
        school_id = self.request.query_params.get('school', None)
        
        if faculty_id:
            queryset = queryset.filter(added_by=faculty_id)
        
        if school_id:
            queryset = queryset.filter(school=school_id)
            
        return queryset

# ---------------- Class Student ViewSet ----------------
class ClassStudentViewSet(viewsets.ModelViewSet):
    queryset = ClassStudent.objects.all()
    serializer_class = ClassStudentSerializer

    def get_queryset(self):
        queryset = ClassStudent.objects.all()
        class_instance = self.request.query_params.get('class_instance', None)
        
        if class_instance is not None:
            queryset = queryset.filter(class_instance=class_instance)
            
        # For debugging - check what we're returning
        print(f"ClassStudentViewSet query for class_instance {class_instance}: Found {queryset.count()} records")
            
        return queryset

# ---------------- Register Student ----------------
@api_view(['POST'])
def register_student(request):
    # Validate request data
    serializer = StudentRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        email = request.data.get('email')
        student_id = request.data.get('student_id')
        
        try:
            # Check if a pending student with this email exists
            pending_student = PendingStudent.objects.filter(email=email).first()
            
            if not pending_student:
                # Also try finding by student ID as a fallback
                pending_student = PendingStudent.objects.filter(student_id=student_id).first()
            
            if pending_student:
                print(f"Found existing pending student with email: {email}")
                
                # Create registered student using pending student data, but with the data from registration form
                student = serializer.save(email_verified=False)
                
                # Update any ClassStudent records to point to the actual student
                class_associations = ClassStudent.objects.filter(pending_student=pending_student)
                association_count = 0
                
                for association in class_associations:
                    association.student = student
                    association.pending_student = None
                    association.save()
                    association_count += 1
                
                print(f"Updated {association_count} class associations for student {email}")
                
                # Delete the pending student record
                pending_student_id = pending_student.id
                pending_student.delete()
                print(f"Deleted pending student with id {pending_student_id}")
                
            else:
                # No pending student found, just create a new student
                print(f"No pending student found for {email}, creating new student")
                student = serializer.save(email_verified=False)
        
            # Generate verification token
            token = jwt.encode({
                'student_id': str(student.id),
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, settings.SECRET_KEY, algorithm='HS256')

            # Create verification URL for email
            verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"

            # Send verification email
            html_message = f"""
            <h3>Verify your email for ClassAttend</h3>
            <p>Thank you for registering. Please click the button below to verify your email address:</p>
            <p><a href="{verification_url}" style="background-color: #DEA514; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p>{verification_url}</p>
            """

            try:
                send_mail(
                    subject="Verify your ClassAttend account",
                    message=f"Please click the following link to verify your email: {verification_url}",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    html_message=html_message,
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Error sending verification email: {str(e)}")
                # Continue with registration even if email fails
            
            # Return the success response with the student ID
            return Response({
                'message': 'Registration successful. Please check your email for verification instructions.',
                'student_id': str(student.id)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Exception during student registration: {str(e)}")
            traceback.print_exc()
            return Response({
                'error': f'Registration error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ---------------- Verify Email ----------------
@api_view(['GET'])
def verify_email(request):
    token = request.query_params.get('token')
    user_type = request.query_params.get('type', 'student')
    
    if not token:
        return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        
        if user_type == 'faculty':
            faculty_id = payload.get('faculty_id')
            faculty = Faculty.objects.get(id=faculty_id)
            faculty.email_verified = True
            faculty.save()
            
            return Response({
                'message': 'Email verified successfully. You can now sign in.',
                'faculty_id': faculty_id,
                'school_id': str(faculty.school.id)
            })
        else:
            # Handle student email verification
            student_id = payload.get('student_id')
            if not student_id:
                raise jwt.InvalidTokenError('Invalid student token')
            user = Student.objects.get(id=student_id)

            user.email_verified = True
            user.save()

            return Response({
                'message': 'Email verified successfully',
                'student_id': str(student_id)
            })
    except jwt.ExpiredSignatureError:
        return Response({'error': 'Verification link has expired'}, status=status.HTTP_400_BAD_REQUEST)
    except (jwt.DecodeError, jwt.InvalidTokenError):
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
    except (Faculty.DoesNotExist, Student.DoesNotExist):
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Verification error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ---------------- Student Sign In ----------------
@api_view(['POST'])
def student_signin(request):
    email = request.data.get('email')
    student_id = request.data.get('student_id')
    remember_me = request.data.get('remember_me', False)

    try:
        student = Student.objects.get(email=email)

        if student.student_id != student_id:
            return Response({'error': 'Invalid student ID'}, status=status.HTTP_400_BAD_REQUEST)

        # Token expiration: 30 days if "Remember Me" is selected, otherwise 24 hours
        token_expiration = timedelta(days=30) if remember_me else timedelta(hours=24)
        token = jwt.encode({
            'student_id': str(student.id),
            'exp': datetime.utcnow() + token_expiration
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

        return Response({'message': 'Please check your email for the sign-in link.'})

    except Student.DoesNotExist:
        return Response({'error': 'No account found with this email'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        traceback.print_exc()
        return Response({'error': 'An error occurred during sign in'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ---------------- Student Direct Sign In ----------------
@api_view(['POST'])
def student_direct_signin(request):
    email = request.data.get('email')
    student_id = request.data.get('student_id')
    remember_me = request.data.get('remember_me', False)

    if not email or not student_id:
        return Response({'error': 'Email and Student ID are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        student = Student.objects.get(email=email)

        # Verify the student ID matches
        if student.student_id != student_id:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # Token expiration: 30 days if "Remember Me" is selected, otherwise 24 hours
        token_expiration = timedelta(days=30) if remember_me else timedelta(hours=24)

        # Generate token
        token = jwt.encode({
            'student_id': str(student.id),
            'exp': datetime.utcnow() + token_expiration
        }, settings.SECRET_KEY, algorithm='HS256')

        # Return token and student info directly
        return Response({
            'message': 'Sign-in successful',
            'token': token,
            'student_id': str(student.id),
            'first_name': student.first_name,
            'last_name': student.last_name
        })

    except Student.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        traceback.print_exc()
        return Response({'error': 'An error occurred during sign in'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ---------------- Faculty ViewSet ----------------
class FacultyViewSet(viewsets.ModelViewSet):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer

    def perform_destroy(self, instance):
        # When deleting a faculty, we also want to delete all related data
        # First, get all classes created by this faculty
        classes = Class.objects.filter(faculty=instance)

        # Get all events created by this faculty
        events = Event.objects.filter(faculty=instance)

        # Delete all class-event associations where the event is from this faculty
        for event in events:
            ClassEvent.objects.filter(event=event).delete()

        # Delete all attendance records for events created by this faculty
        for event in events:
            Attendance.objects.filter(event=event).delete()

        # Delete all student-class associations for classes created by this faculty
        for class_instance in classes:
            ClassStudent.objects.filter(class_instance=class_instance).delete()

        # Delete all classes
        classes.delete()

        # Delete all events
        events.delete()

        # Finally, delete the faculty account
        instance.delete()

# ---------------- Faculty SignIn ----------------
@api_view(['POST'])
def faculty_signin(request):
    """Faculty sign in with email"""
    email = request.data.get('email')
    remember_me = request.data.get('remember_me', False)

    try:
        faculty = Faculty.objects.get(email=email)

        if not faculty.email_verified:
            return Response({
                'error': 'Please verify your email address first'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Token expiration: 30 days if "Remember Me" is selected, otherwise 24 hours
        token_expiration = timedelta(days=30) if remember_me else timedelta(days=1)

        # Generate authentication token
        token = jwt.encode({
            'faculty_id': str(faculty.id),
            'exp': datetime.utcnow() + token_expiration
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

        # Add debug logging to see if this part is reached
        print(f"Attempting to send sign-in email to faculty: {email}")
        
        try:
            send_mail(
                subject="ClassAttend Faculty Sign In Link",
                message=f"Click the following link to sign in: {signin_url}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[faculty.email],
                html_message=html_message,
                fail_silently=False,  # Set to False to see errors
            )
            print(f"Email sent successfully to {email}")
        except Exception as email_error:
            # Log specific email sending error
            print(f"ERROR sending email to {email}: {str(email_error)}")
            traceback.print_exc()
            return Response({
                'error': f'Failed to send sign-in email: {str(email_error)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'message': 'Please check your email for the sign-in link.'
        })

    except Faculty.DoesNotExist:
        return Response({
            'error': 'No faculty account found with this email address'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"General error in faculty_signin: {str(e)}")
        traceback.print_exc()
        return Response({
            'error': f'Sign in error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ---------------- Event ViewSet ----------------
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def perform_update(self, serializer):
        # Get the event and faculty ID
        event = self.get_object()
        faculty_id = self.request.query_params.get('faculty_id')
        if not faculty_id:
            faculty_id = self.request.data.get('faculty')

        # Check permission: is creator OR is admin
        has_permission = False
        
        # Check if faculty is event creator
        is_creator = str(event.faculty.id) == str(faculty_id)
        if is_creator:
            has_permission = True
            
        # Check if faculty is admin with appropriate permissions
        if not has_permission:
            try:
                faculty = Faculty.objects.get(id=faculty_id)
                faculty_email = faculty.email
                
                # Try to find admin account with this email
                admin = Admin.objects.filter(email=faculty_email).first()
                
                if admin and admin.role in ['master', 'co']:
                    # Master and co-admins can edit any event
                    has_permission = True
                elif admin and admin.role == 'sub':
                    # Sub-admins can only edit events in their school
                    admin_school_id = faculty.school.id
                    event_school_id = event.school.id
                    if str(admin_school_id) == str(event_school_id):
                        has_permission = True
            except Exception as e:
                print(f"Error checking admin permissions: {str(e)}")

        # Raise permission denied if no permission
        if not has_permission:
            raise PermissionDenied("You don't have permission to edit this event")

        serializer.save()

    def perform_destroy(self, instance):
        # Get faculty ID
        faculty_id = self.request.query_params.get('faculty_id')
        if not faculty_id:
            faculty_id = self.request.data.get('faculty')

        # Check permission: is creator OR is admin
        has_permission = False
        
        # Check if faculty is event creator
        is_creator = str(instance.faculty.id) == str(faculty_id)
        if is_creator:
            has_permission = True
            
        # Check if faculty is admin with appropriate permissions
        if not has_permission:
            try:
                faculty = Faculty.objects.get(id=faculty_id)
                faculty_email = faculty.email
                
                # Try to find admin account with this email
                admin = Admin.objects.filter(email=faculty_email).first()
                
                if admin and admin.role in ['master', 'co']:
                    # Master and co-admins can delete any event
                    has_permission = True
                elif admin and admin.role == 'sub':
                    # Sub-admins can only delete events in their school
                    admin_school_id = faculty.school.id
                    event_school_id = instance.school.id
                    if str(admin_school_id) == str(event_school_id):
                        has_permission = True
            except Exception as e:
                print(f"Error checking admin permissions: {str(e)}")

        # Raise permission denied if no permission
        if not has_permission:
            raise PermissionDenied("You don't have permission to delete this event")

        instance.delete()

@api_view(['GET', 'PUT', 'DELETE'])
def event_detail(request, pk):
    """
    Retrieve, update or delete an event.
    """
    try:
        event = Event.objects.get(pk=pk)
    except Event.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    # Get the faculty ID from the request
    faculty_id = request.GET.get('faculty_id')
    
    if not faculty_id:
        return Response({"error": "Faculty ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'GET':
        serializer = EventSerializer(event)
        return Response(serializer.data)

    # For update and delete operations, check permissions
    elif request.method == 'PUT' or request.method == 'DELETE':
        # Check if faculty is event creator
        is_creator = str(event.faculty.id) == str(faculty_id)
        
        # Check if faculty is admin
        is_admin = False
        admin_school_id = None
        
        # Get the faculty's email to check for admin status
        try:
            faculty = Faculty.objects.get(id=faculty_id)
            faculty_email = faculty.email
            
            # Check if the faculty is also an admin
            try:
                admin = Admin.objects.filter(email=faculty_email).first()
                if admin and admin.role in ['master', 'co', 'sub']:
                    is_admin = True
                    
                    # For sub-admin, check if they belong to same school as event
                    if admin.role == 'sub':
                        admin_school_id = faculty.school.id  # The school ID of the sub-admin faculty
                        
            except Exception as e:
                print(f"Error checking admin status: {str(e)}")
                pass
                
        except Exception as e:
            print(f"Error getting faculty email: {str(e)}")
            pass
            
        # Permission check
        has_permission = is_creator  # Faculty always can edit/delete own events
        
        # Admin permission logic
        if not has_permission and is_admin:
            if admin.role in ['master', 'co']:  # Master and co-admins can edit any event
                has_permission = True
            elif admin.role == 'sub' and str(admin_school_id) == str(event.school.id):  # Sub-admins can only edit events from their school
                has_permission = True
        
        # Return 403 Forbidden if no permission
        if not has_permission:
            return Response({"error": "You do not have permission to modify this event"}, status=status.HTTP_403_FORBIDDEN)
            
        # Process the request
        if request.method == 'PUT':
            serializer = EventSerializer(event, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        elif request.method == 'DELETE':
            event.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

# ---------------- Class ViewSet ----------------
class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    
    def get_queryset(self):
        queryset = Class.objects.all()
        
        faculty_id = self.request.query_params.get('faculty', None)
        
        if faculty_id is not None:
            queryset = queryset.filter(faculty__id=faculty_id)
            
        return queryset

    
    def perform_create(self, serializer):
        serializer.save()
    
    def perform_update(self, serializer):
        # Ensure only the creator can update
        class_instance = self.get_object()
        faculty_id = self.request.query_params.get('faculty_id')
        if not faculty_id:
            faculty_id = self.request.data.get('faculty')
            
        if str(class_instance.faculty.id) != str(faculty_id):
            raise PermissionDenied("You don't have permission to edit this class")
        
        serializer.save()
        
    def perform_destroy(self, instance):
        # Ensure only the creator can delete
        faculty_id = self.request.query_params.get('faculty_id')
        if not faculty_id:
            faculty_id = self.request.data.get('faculty')
            
        if str(instance.faculty.id) != str(faculty_id):
            raise PermissionDenied("You don't have permission to delete this class")
        
        instance.delete()

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

# ---------------- Create Class ----------------
@api_view(['POST'])
def create_class(request):
    # Get the faculty member from the authentication token
    faculty_id = request.data.get('faculty_id')
    
    try:
        faculty = Faculty.objects.get(id=faculty_id)
        
        # Create the class
        class_data = {
            'name': request.data.get('name'),
            'faculty': faculty.id,
            'school': faculty.school.id,
            'semester': request.data.get('semester')  # Add semester field
        }
        
        serializer = ClassSerializer(data=class_data)
        if serializer.is_valid():
            new_class = serializer.save()
            
            # If students are provided, add them to the class
            student_info_list = request.data.get('students', [])
            for student_info in student_info_list:
                try:
                    # Try to find the student by email first
                    email = student_info.get('email')
                    if not email:
                        continue
                        
                    student = None
                    pending_student = None
                    
                    # Check if student exists already
                    try:
                        student = Student.objects.get(email=email)
                        # If student exists, create the association
                        ClassStudent.objects.create(
                            class_instance=new_class,
                            student=student
                        )
                        print(f"Added registered student {email} to class")
                    except Student.DoesNotExist:
                        # Student doesn't exist in registered students
                        # Check if email exists in pending students
                        try:
                            pending_student = PendingStudent.objects.get(email=email)
                            # Update pending student info if needed
                            pending_student.first_name = student_info.get('firstName', student_info.get('first_name', pending_student.first_name))
                            pending_student.last_name = student_info.get('lastName', student_info.get('last_name', pending_student.last_name))
                            pending_student.student_id = student_info.get('studentId', student_info.get('student_id', pending_student.student_id))
                            pending_student.save()
                        except PendingStudent.DoesNotExist:
                            # Create new pending student
                            pending_student = PendingStudent.objects.create(
                                first_name=student_info.get('firstName', student_info.get('first_name', '')),
                                last_name=student_info.get('lastName', student_info.get('last_name', '')),
                                student_id=student_info.get('studentId', student_info.get('student_id', '')),
                                email=email,
                                school=faculty.school,
                                added_by=faculty
                            )
                        
                        # IMPORTANT: Create association with pending student
                        if pending_student:
                            # Explicitly create the ClassStudent entry for the pending student
                            ClassStudent.objects.create(
                                class_instance=new_class,
                                pending_student=pending_student
                            )
                            print(f"Added pending student {email} to ClassStudent table")
                        
                except Exception as e:
                    print(f"Error processing student {email if 'email' in locals() else 'unknown'}: {str(e)}")
                    continue
            
            return Response({
                'message': 'Class created successfully',
                'class': ClassSerializer(new_class).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Faculty.DoesNotExist:
        return Response({
            'error': 'Faculty not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        traceback.print_exc()
        return Response({
            'error': f'Error creating class: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def lookup_student(request):
    """Look up a student by email"""
    email = request.query_params.get('email')
    
    if not email:
        return Response({'error': 'Email parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # First try to find a registered student
        student = Student.objects.get(email=email)
        return Response({
            'id': str(student.id),
            'email': student.email,
            'first_name': student.first_name,
            'last_name': student.last_name,
            'student_id': student.student_id,
            'status': 'registered'
        })
    except Student.DoesNotExist:
        # Then check for a pending student
        try:
            pending = PendingStudent.objects.get(email=email)
            return Response({
                'id': str(pending.id),
                'email': pending.email,
                'first_name': pending.first_name,
                'last_name': pending.last_name,
                'student_id': pending.student_id,
                'status': 'pending'
            })
        except PendingStudent.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

# ---------------- Faculty Add Student ----------------
@api_view(['POST'])
def faculty_add_student(request):
    """API endpoint for faculty adding a student to a class - always creates PendingStudent"""
    try:
        # Required fields
        email = request.data.get('email')
        first_name = request.data.get('firstName') or request.data.get('first_name', '')
        last_name = request.data.get('lastName') or request.data.get('last_name', '')
        student_id = request.data.get('studentId') or request.data.get('student_id', '')
        faculty_id = request.data.get('faculty_id')
        school_id = request.data.get('school_id')
        class_id = request.data.get('class_id')
        
        if not email or not faculty_id or not school_id:
            return Response({
                'error': 'Email, faculty_id and school_id are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if student already exists as registered user
        try:
            student = Student.objects.get(email=email)
            # If class_id provided, associate with class
            if class_id:
                try:
                    class_obj = Class.objects.get(id=class_id)
                    if not ClassStudent.objects.filter(class_instance=class_obj, student=student).exists():
                        ClassStudent.objects.create(
                            class_instance=class_obj,
                            student=student
                        )
                        print(f"Added registered student {email} to class {class_id}")
                except (Class.DoesNotExist, Exception) as e:
                    print(f"Error associating student with class: {str(e)}")
            
            # Return the existing student info
            return Response({
                'id': str(student.id),
                'email': student.email,
                'first_name': student.first_name,
                'last_name': student.last_name,
                'student_id': student.student_id,
                'status': 'registered',
                'message': 'Student already registered'
            })
        except Student.DoesNotExist:
            # Check if already a pending student
            try:
                pending = PendingStudent.objects.get(email=email)
                # Update pending student info if needed
                if first_name:
                    pending.first_name = first_name
                if last_name:
                    pending.last_name = last_name
                if student_id:
                    pending.student_id = student_id
                pending.save()
                
                # If class_id provided, associate with class
                if class_id:
                    try:
                        class_obj = Class.objects.get(id=class_id)
                        if not ClassStudent.objects.filter(class_instance=class_obj, pending_student=pending).exists():
                            ClassStudent.objects.create(
                                class_instance=class_obj,
                                pending_student=pending
                            )
                            print(f"Added pending student {email} to class {class_id}")
                    except (Class.DoesNotExist, Exception) as e:
                        print(f"Error associating pending student with class: {str(e)}")
                
                return Response({
                    'id': str(pending.id),
                    'email': pending.email,
                    'first_name': pending.first_name,
                    'last_name': pending.last_name,
                    'student_id': pending.student_id,
                    'status': 'pending',
                    'message': 'Pending student updated'
                })
            except PendingStudent.DoesNotExist:
                # Create new pending student
                try:
                    faculty = Faculty.objects.get(id=faculty_id)
                    school = School.objects.get(id=school_id)
                    
                    pending = PendingStudent.objects.create(
                        first_name=first_name,
                        last_name=last_name,
                        student_id=student_id,
                        email=email,
                        school=school,
                        added_by=faculty
                    )
                    
                    # If class_id provided, associate with class
                    if class_id:
                        try:
                            class_obj = Class.objects.get(id=class_id)
                            ClassStudent.objects.create(
                                class_instance=class_obj,
                                pending_student=pending
                            )
                            print(f"Created and added pending student {email} to class {class_id}")
                        except (Class.DoesNotExist, Exception) as e:
                            print(f"Error associating new pending student with class: {str(e)}")
                    
                    return Response({
                        'id': str(pending.id),
                        'email': pending.email,
                        'first_name': pending.first_name,
                        'last_name': pending.last_name,
                        'student_id': pending.student_id,
                        'status': 'pending',
                        'message': 'Pending student created'
                    }, status=status.HTTP_201_CREATED)
                except (Faculty.DoesNotExist, School.DoesNotExist) as e:
                    return Response({
                        'error': f'Error finding faculty or school: {str(e)}'
                    }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        print(f"Exception in faculty_add_student: {str(e)}")
        traceback.print_exc()
        return Response({
            'error': f'Error adding student: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ---------------- Update Class ----------------
@api_view(['PUT'])
def update_class(request, pk):
    try:
        class_instance = Class.objects.get(pk=pk)
        
        # Update basic class information
        class_instance.name = request.data.get('name', class_instance.name)
        
        # Update semester field directly
        if 'semester' in request.data:
            class_instance.semester = request.data['semester']
            
        # Update description/metadata
        if 'description' in request.data:
            class_instance.description = request.data['description']
        
        class_instance.save()
        
        # Update students if provided
        if 'students' in request.data:
            # Remove existing student associations
            ClassStudent.objects.filter(class_instance=class_instance).delete()
            
            # Process each student
            student_items = request.data.get('students', [])
            faculty = class_instance.faculty
            
            for item in student_items:
                try:
                    if isinstance(item, str):
                        # Handle UUID string (already registered student)
                        try:
                            student = Student.objects.get(id=item)
                            ClassStudent.objects.create(
                                class_instance=class_instance,
                                student=student
                            )
                            print(f"Added registered student ID {item} to class")
                        except Student.DoesNotExist:
                            print(f"Student with ID {item} not found")
                            # Check if it's a pending student ID
                            try:
                                pending_student = PendingStudent.objects.get(id=item)
                                ClassStudent.objects.create(
                                    class_instance=class_instance,
                                    pending_student=pending_student
                                )
                                print(f"Added pending student ID {item} to class")
                            except PendingStudent.DoesNotExist:
                                print(f"Student with ID {item} not found")
                        continue
                    # Handle object format (from manual add or CSV)
                    if isinstance(item, dict):
                        email = item.get('email')
                        if not email:
                            print("Skipping student with no email")
                            continue
                        
                        # First check if student is already registered
                        registered_student = None
                        pending_student = None
                        try:
                            registered_student = Student.objects.get(email=email)
                            # If we find the student, create the class association
                            ClassStudent.objects.create(
                                class_instance=class_instance,
                                student=registered_student
                            )
                            print(f"Added registered student {email} to class")
                            continue  # Skip to next student
                        except Student.DoesNotExist:
                            # Student not registered, now check if they're pending
                            try:
                                pending_student = PendingStudent.objects.get(email=email)
                                # Update pending student info if needed
                                pending_student.first_name = item.get('firstName', item.get('first_name', pending_student.first_name))
                                pending_student.last_name = item.get('lastName', item.get('last_name', pending_student.last_name))
                                pending_student.student_id = item.get('studentId', item.get('student_id', pending_student.student_id))
                                pending_student.save()
                                print(f"Updated pending student {email}")
                            except PendingStudent.DoesNotExist:
                                # Create new pending student
                                pending_student = PendingStudent.objects.create(
                                    first_name=item.get('firstName', item.get('first_name', '')),
                                    last_name=item.get('lastName', item.get('last_name', '')),
                                    student_id=item.get('studentId', item.get('student_id', '')),
                                    email=email,
                                    school=faculty.school,
                                    added_by=faculty
                                )
                                print(f"Created pending student {email}")
                            # Create association with the pending student
                            if pending_student:
                                ClassStudent.objects.create(
                                    class_instance=class_instance,
                                    pending_student=pending_student
                                )
                                print(f"Added pending student {email} to ClassStudent table directly")
                except Exception as e:
                    print(f"Error processing student: {str(e)}")
                    traceback.print_exc()
                    continue
        
        return Response({
            'message': 'Class updated successfully',
            'class': ClassSerializer(class_instance).data
        })
    except Class.DoesNotExist:
        return Response({'error': 'Class not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Exception in update_class: {str(e)}")
        traceback.print_exc()
        return Response({'error': f'Error updating class: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ---------------- Class Event ViewSet ----------------
class ClassEventViewSet(viewsets.ModelViewSet):
    queryset = ClassEvent.objects.all()
    serializer_class = ClassEventSerializer

    def get_queryset(self):
        queryset = ClassEvent.objects.all()
        class_instance = self.request.query_params.get('class_instance', None)
        if class_instance is not None:
            queryset = queryset.filter(class_instance=class_instance)
        return queryset

@api_view(['GET'])
def generate_event_qr(request, event_id):
    """Generate a QR code PDF for an event with instructions on page 1 and event details on page 2"""
    try:
        # Convert string to UUID if needed
        event_uuid = UUID(event_id)
        # Get the event
        event = Event.objects.get(pk=event_uuid)
        # Create event attendance URL - this will be the data in the QR code
        attendance_url = f"https://trueattend.onrender.com/attend/{event_id}"
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(attendance_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        # Create a byte buffer for the image
        img_buffer = io.BytesIO()
        img.save(img_buffer)
        img_buffer.seek(0)
        
        # Create a PDF
        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=letter)
        
        # PAGE 1: Instructions
        pdf.setFont("Helvetica-Bold", 18)
        pdf.drawString(1*inch, 10*inch, "TrueAttend - Attendance Instructions")
        
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(1*inch, 9*inch, "Instructions:")
        
        pdf.setFont("Helvetica", 12)
        pdf.drawString(1*inch, 8.5*inch, "1. Print this QR code and display it at the event")
        pdf.drawString(1*inch, 8.0*inch, "2. Have students scan this code with the ClassAttend web app")
        pdf.drawString(1*inch, 7.5*inch, "3. Students must be logged in to record attendance")
        
        pdf.setFont("Helvetica-Oblique", 10)
        pdf.drawString(1*inch, 2*inch, "Please see the next page for your event details and QR code.")
        
        # Move to page 2
        pdf.showPage()
        
        # PAGE 2: Event info and QR code
        pdf.setFont("Helvetica-Bold", 18)
        pdf.drawString(1*inch, 10*inch, "Event Details")
        
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(1*inch, 9.5*inch, "Event:")
        pdf.setFont("Helvetica", 14)
        pdf.drawString(2*inch, 9.5*inch, event.name)
        
        # Format and display date and time
        event_date = event.date.strftime('%B %d, %Y')
        start_time = event.date.strftime('%I:%M %p')
        
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(1*inch, 9*inch, "Date:")
        pdf.setFont("Helvetica", 14)
        pdf.drawString(2*inch, 9*inch, event_date)
        
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(1*inch, 8.5*inch, "Time:")
        pdf.setFont("Helvetica", 14)
        if event.end_time:
            end_time = event.end_time.strftime('%I:%M %p')
            pdf.drawString(2*inch, 8.5*inch, f"{start_time} - {end_time}")
        else:
            pdf.drawString(2*inch, 8.5*inch, start_time)
        
        if event.location:
            pdf.setFont("Helvetica-Bold", 14)
            pdf.drawString(1*inch, 8*inch, "Location:")
            pdf.setFont("Helvetica", 14)
            pdf.drawString(2*inch, 8*inch, event.location)
        
        # Add QR code to PDF - centered on page
        img_pil = Image.open(img_buffer)
        pdf.drawInlineImage(img_pil, 2.5*inch, 3*inch, width=4*inch, height=4*inch)
        
        pdf.save()
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="event_{event_id}_qr.pdf"'
        return response
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def update_faculty_profile(request, pk):
    """Update just the first and last name of a faculty member"""
    try:
        faculty = Faculty.objects.get(pk=pk)
        if 'first_name' in request.data:
            faculty.first_name = request.data['first_name']
        if 'last_name' in request.data:
            faculty.last_name = request.data['last_name']
        faculty.save()
        return Response({
            'id': str(faculty.id),
            'first_name': faculty.first_name,
            'last_name': faculty.last_name,
            'email': faculty.email
        })
    except Faculty.DoesNotExist:
        return Response({'error': 'Faculty not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_student_profile(request, pk):
    """Update student profile information"""
    try:
        student = Student.objects.get(pk=pk)
        if 'first_name' in request.data:
            student.first_name = request.data['first_name']
        if 'last_name' in request.data:
            student.last_name = request.data['last_name']
        if 'student_id' in request.data and request.data['student_id'] != student.student_id:
            if Student.objects.filter(student_id=request.data['student_id']).exclude(pk=pk).exists():
                return Response({'error': 'This student ID is already in use'}, status=status.HTTP_400_BAD_REQUEST)
            student.student_id = request.data['student_id']
        student.save()
        return Response({
            'id': str(student.id),
            'first_name': student.first_name,
            'last_name': student.last_name,
            'email': student.email,
            'student_id': student.student_id
        })
    except Student.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_class_event_attendance(request, event_id, class_id):
    """Get attendance data for a specific event and class"""
    try:
        class_instance = Class.objects.get(pk=class_id)
        event = Event.objects.get(pk=event_id)
        if request.user.is_authenticated and hasattr(request.user, 'faculty'):
            faculty = request.user.faculty
        else:
            faculty_id = request.query_params.get('faculty_id')
            if faculty_id:
                faculty = Faculty.objects.get(pk=faculty_id)
            else:
                return Response({"error": "Faculty authentication required"}, status=401)
        if class_instance.faculty.id != faculty.id:
            return Response({"error": "You do not have permission to access this data"}, status=403)
        class_students = ClassStudent.objects.filter(class_instance=class_instance)
        student_ids = [cs.student.id for cs in class_students]
        attendance_records = Attendance.objects.filter(
            event=event,
            student__id__in=student_ids
        ).select_related('student')
        attendance_data = []
        for record in attendance_records:
            attendance_data.append({
                'student_id': record.student.id,
                'first_name': record.student.first_name,
                'last_name': record.student.last_name,
                'email': record.student.email,
                'student_id_number': record.student.student_id,
                'attended': True,
                'scanned_at': record.scanned_at,
                'location': record.location,
                'device_id': record.device_id
            })
        return Response(attendance_data)
    except Class.DoesNotExist:
        return Response({"error": "Class not found"}, status=404)
    except Event.DoesNotExist:
        return Response({"error": "Event not found"}, status=404)
    except Faculty.DoesNotExist:
        return Response({"error": "Faculty not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['DELETE'])
def delete_student_account(request, pk):
    """Delete a student account and all associated data"""
    try:
        student = Student.objects.get(pk=pk)
        Attendance.objects.filter(student=student).delete()
        ClassStudent.objects.filter(student=student).delete()
        student.delete()
        return Response({'message': 'Account successfully deleted'}, status=status.HTTP_200_OK)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_student_attendance(request, student_id):
    """Get attendance history for a specific student"""
    try:
        student = Student.objects.get(pk=student_id)
        attendance_records = Attendance.objects.filter(student=student).order_by('-scanned_at')
        attendance_data = []
        for record in attendance_records:
            event = record.event
            attendance_data.append({
                'id': str(record.id),
                'event_id': str(event.id),
                'event_name': event.name,
                'event_date': event.date,
                'event_end_time': event.end_time,
                'event_location': event.location or 'No location specified',
                'scanned_at': record.scanned_at,
            })
        return Response(attendance_data)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ---------------- Admin ViewSet ----------------
class AdminViewSet(viewsets.ModelViewSet):
    queryset = Admin.objects.all()
    serializer_class = AdminSerializer
    
    def get_queryset(self):
        queryset = Admin.objects.all()
        
        # Filter by role if specified
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        
        # Filter by school if specified
        school_id = self.request.query_params.get('school')
        if school_id:
            queryset = queryset.filter(school=school_id)
            
        return queryset

# ---------------- Admin Authentication ----------------
@api_view(['POST'])
def admin_register(request):
    """Register a new administrator - only master admins can do this"""
    admin_role = request.data.get('role', 'sub')
    
    # Validate the requesting admin is authorized to create new admins
    requester_id = request.data.get('requester_id')
    try:
        if requester_id:
            requester = Admin.objects.get(id=requester_id)
            # Only master admins can create other admins
            if requester.role != 'master' and admin_role != 'sub':
                return Response({
                    'error': 'Only master administrators can create co-administrators or other master administrators'
                }, status=status.HTTP_403_FORBIDDEN)
            # Co-admins can only create sub-admins
            if requester.role == 'co' and admin_role != 'sub':
                return Response({
                    'error': 'Co-administrators can only create university administrators'
                }, status=status.HTTP_403_FORBIDDEN)
        else:
            # First admin creation doesn't require authorization (system setup)
            if Admin.objects.count() > 0:
                return Response({
                    'error': 'Unauthorized admin creation attempt'
                }, status=status.HTTP_403_FORBIDDEN)
    except Admin.DoesNotExist:
        return Response({
            'error': 'Invalid requester'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = AdminRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        try:
            # Hash the password
            password = serializer.validated_data.pop('password')
            admin = serializer.save(
                password_hash=make_password(password)
            )
            
            return Response({
                'message': 'Administrator account created successfully',
                'admin_id': str(admin.id),
                'email': admin.email
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error creating admin: {str(e)}")
            traceback.print_exc()
            return Response({
                'error': f'Registration error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def admin_signin(request):
    """Admin sign in with email and password"""
    email = request.data.get('email')
    password = request.data.get('password')
    remember_me = request.data.get('remember_me', False)
    
    if not email or not password:
        return Response({
            'error': 'Email and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        admin = Admin.objects.get(email=email)
        
        # Check password
        if not check_password(password, admin.password_hash):
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Update last login time
        admin.last_login = datetime.utcnow()
        admin.save()
        
        # Token expiration: 30 days if "Remember Me" is selected, otherwise 24 hours
        token_expiration = timedelta(days=30) if remember_me else timedelta(hours=24)
        
        # Generate token
        token_payload = {
            'admin_id': str(admin.id),
            'email': admin.email,
            'role': admin.role,
            'exp': datetime.utcnow() + token_expiration
        }
        
        if admin.school:
            token_payload['school_id'] = str(admin.school.id)
            
        token = jwt.encode(token_payload, settings.SECRET_KEY, algorithm='HS256')
        
        # Return admin info and token
        return Response({
            'message': 'Sign-in successful',
            'token': token,
            'admin_id': str(admin.id),
            'role': admin.role,
            'first_name': admin.first_name,
            'last_name': admin.last_name,
            'school_id': str(admin.school.id) if admin.school else None
        })
        
    except Admin.DoesNotExist:
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        print(f"Error in admin sign in: {str(e)}")
        traceback.print_exc()
        return Response({
            'error': 'An error occurred during sign in'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def admin_profile(request, pk):
    """Get admin profile information"""
    try:
        admin = Admin.objects.get(pk=pk)
        serializer = AdminSerializer(admin)
        return Response(serializer.data)
    except Admin.DoesNotExist:
        return Response({
            'error': 'Administrator not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def admin_stats(request):
    """Get statistics for the admin dashboard"""
    # You can modify this based on what statistics you want to display
    try:
        stats = {
            'universities': School.objects.count(),
            'faculty': Faculty.objects.count(),
            'students': Student.objects.count(),
            'events': Event.objects.count(),
            'admins': Admin.objects.count(),
        }
        return Response(stats)
    except Exception as e:
        return Response({
            'error': f'Error fetching statistics: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def admin_recent_activity(request):
    """Get recent activity data for admin dashboard"""
    try:
        # Get recent faculty registrations
        recent_faculty = Faculty.objects.order_by('-id')[:5]
        faculty_activity = [
            {
                'id': f"faculty_{faculty.id}",
                'type': 'faculty_added',
                'name': f"{faculty.first_name} {faculty.last_name}",
                'university': faculty.school.name,
                'timestamp': faculty.email_verified.isoformat() if hasattr(faculty, 'email_verified') else datetime.now().isoformat()
            }
            for faculty in recent_faculty
        ]
        
        # Get recent events
        recent_events = Event.objects.order_by('-date')[:5]
        event_activity = [
            {
                'id': f"event_{event.id}",
                'type': 'event_created',
                'name': event.name,
                'university': event.school.name,
                'timestamp': event.date.isoformat()
            }
            for event in recent_events
        ]
        
        # Combine and sort by timestamp
        activities = faculty_activity + event_activity
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return Response(activities[:10])  # Return the 10 most recent activities
    except Exception as e:
        return Response({
            'error': f'Error fetching recent activity: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def promote_faculty_to_admin(request):
    """Promote a faculty member to an administrator role"""
    try:
        # Check authorization - only master and co-admins can promote faculty
        requester_id = request.data.get('requester_id')
        if not requester_id:
            return Response({
                'error': 'Requester ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            requester = Admin.objects.get(id=requester_id)
            # Check if requester has appropriate role
            if requester.role not in ['master', 'co']:
                return Response({
                    'error': 'Only master and co-administrators can promote faculty members'
                }, status=status.HTTP_403_FORBIDDEN)
        except Admin.DoesNotExist:
            return Response({
                'error': 'Invalid requester'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get parameters
        faculty_id = request.data.get('faculty_id')
        if not faculty_id:
            return Response({
                'error': 'Faculty ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        role = request.data.get('role', 'sub')  # Default to sub-admin
        
        # Prevent anyone from setting master role
        if role == 'master':
            return Response({
                'error': 'Master administrator role cannot be assigned through the API'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Co-admins can only create sub-admins
        if requester.role == 'co' and role != 'sub':
            return Response({
                'error': 'Co-administrators can only promote faculty to university admin role'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get the faculty
        try:
            faculty = Faculty.objects.get(id=faculty_id)
        except Faculty.DoesNotExist:
            return Response({
                'error': 'Faculty not found'
            }, status=status.HTTP_404_NOT_FOUND)
            
        # Check if faculty already has an admin account
        if Admin.objects.filter(email=faculty.email).exists():
            return Response({
                'error': 'This faculty member already has an administrator account'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # Generate a secure random password
        import secrets
        import string
        alphabet = string.ascii_letters + string.digits
        temp_password = ''.join(secrets.choice(alphabet) for i in range(12))
            
        # Create admin account
        admin = Admin.objects.create(
            email=faculty.email,
            first_name=faculty.first_name,
            last_name=faculty.last_name,
            role=role,
            school=faculty.school,
            password_hash=make_password(temp_password),
            faculty=faculty
        )
        
        # Send email with temporary password
        try:
            html_message = f"""
            <h3>You've been promoted to an Administrator</h3>
            <p>You have been promoted to a {admin.get_role_display()} role in the TrueAttend system.</p>
            <p>You can now log in to the administrator panel using your email and the following temporary password:</p>
            <p style="font-size: 16px; font-weight: bold;">{temp_password}</p>
            <p>Please change your password after logging in for the first time.</p>
            <p><a href="{settings.FRONTEND_URL}/auth/admin" style="background-color: #DEA514; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Admin Login</a></p>
            """
            
            send_mail(
                subject="You've been promoted to TrueAttend Administrator",
                message=f"You've been promoted to a {admin.get_role_display()} role. Your temporary password is: {temp_password}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin.email],
                html_message=html_message,
                fail_silently=False,
            )
        except Exception as e:
            # Log the error but continue - we'll just show the temporary password in the response
            print(f"Error sending admin promotion email: {str(e)}")
            
        # Return success with admin info
        return Response({
            'message': 'Faculty member successfully promoted to administrator',
            'admin_id': str(admin.id),
            'email': admin.email,
            'role': admin.role,
            'temp_password': temp_password  # Include the temp password in the response
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Error promoting faculty to admin: {str(e)}")
        traceback.print_exc()
        return Response({
            'error': f'Error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_faculty_by_school(request):
    """Get all faculty members grouped by school with admin status information"""
    try:
        # Check if requester is admin
        admin_id = request.query_params.get('admin_id')
        if not admin_id:
            return Response({
                'error': 'Admin ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            requester = Admin.objects.get(id=admin_id)
        except Admin.DoesNotExist:
            return Response({
                'error': 'Invalid administrator'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # If sub-admin, only show faculty from their school
        if requester.role == 'sub' and requester.school:
            schools = School.objects.filter(id=requester.school.id)
        else:
            # For master and co-admins, show all schools
            schools = School.objects.all()
            
        # Prepare response data
        result = []
        
        for school in schools:
            faculty_list = Faculty.objects.filter(school=school)
            faculty_data = []
            
            for faculty in faculty_list:
                # Check if faculty is already an admin
                admin_role = None
                admin_id = None
                
                try:
                    admin = Admin.objects.get(faculty=faculty)
                    admin_role = admin.role
                    admin_id = str(admin.id)
                except Admin.DoesNotExist:
                    pass
                
                faculty_data.append({
                    'id': str(faculty.id),
                    'first_name': faculty.first_name,
                    'last_name': faculty.last_name,
                    'email': faculty.email,
                    'is_admin': admin_role is not None,
                    'admin_role': admin_role,
                    'admin_id': admin_id
                })
            
            result.append({
                'school_id': str(school.id),
                'school_name': school.name,
                'faculty': faculty_data
            })
            
        return Response(result)
        
    except Exception as e:
        print(f"Error getting faculty by school: {str(e)}")
        traceback.print_exc()
        return Response({
            'error': f'Error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def update_admin_role(request):
    """Update or revoke an admin's role - only available to master and co-administrators"""
    try:
        # Check authorization - only master and co-admins can update roles
        requester_id = request.data.get('requester_id')
        if not requester_id:
            return Response({
                'error': 'Requester ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            requester = Admin.objects.get(id=requester_id)
            # Check if requester has appropriate role
            if requester.role not in ['master', 'co']:
                return Response({
                    'error': 'Only master and co-administrators can update admin roles'
                }, status=status.HTTP_403_FORBIDDEN)
        except Admin.DoesNotExist:
            return Response({
                'error': 'Invalid requester'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get target admin
        admin_id = request.data.get('admin_id')
        if not admin_id:
            return Response({
                'error': 'Admin ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            admin = Admin.objects.get(id=admin_id)
        except Admin.DoesNotExist:
            return Response({
                'error': 'Administrator not found'
            }, status=status.HTTP_404_NOT_FOUND)
            
        # Check for permissions:
        # 1. Only master admins can modify other master admins or modify co-admins
        # 2. Co-admins can only modify sub-admins
        if requester.role == 'co' and (admin.role == 'master' or admin.role == 'co'):
            return Response({
                'error': 'Co-administrators can only modify university administrators'
            }, status=status.HTTP_403_FORBIDDEN)

        new_role = request.data.get('new_role')
        
        # Check if we're revoking admin status entirely
        if new_role == 'revoke':
            # Completely delete the admin record instead of just changing the role
            admin_id = str(admin.id)  # Store ID for the response
            admin_email = admin.email  # Store email for the response
            
            # Delete the admin record
            admin.delete()
            
            return Response({
                'message': 'Administrator privileges revoked successfully',
                'admin_id': admin_id,
                'email': admin_email
            })
            
        # Otherwise updating role - validate role
        if new_role not in ['co', 'sub']:
            return Response({
                'error': 'Invalid role specified. Only "co" and "sub" roles are allowed.'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # Co-admins can only set role to 'sub'
        if requester.role == 'co' and new_role != 'sub':
            return Response({
                'error': 'Co-administrators can only set university administrator role'
            }, status=status.HTTP_403_FORBIDDEN)
            
        # Prevent anyone from setting master role
        if new_role == 'master':
            return Response({
                'error': 'Master administrator role cannot be assigned through the API'
            }, status=status.HTTP_403_FORBIDDEN)
            
        # Update the role
        admin.role = new_role
        admin.save()
        
        # Send notification email
        try:
            html_message = f"""
            <h3>Your Administrator Role Has Been Updated</h3>
            <p>Your role in the TrueAttend system has been updated to {admin.get_role_display()}.</p>
            <p>If you have any questions about your access level or responsibilities, 
            please contact a master administrator.</p>
            <p><a href="{settings.FRONTEND_URL}/auth/admin" 
            style="background-color: #DEA514; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Go to Admin Portal</a></p>
            """
            
            send_mail(
                subject="Your TrueAttend Administrator Role Has Been Updated",
                message=f"Your role has been updated to {admin.get_role_display()}.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin.email],
                html_message=html_message,
                fail_silently=True,  # Don't fail if email sending fails
            )
        except Exception as e:
            # Log but continue - email notification is not critical
            print(f"Error sending role update email: {str(e)}")
        
        # Return success response
        return Response({
            'message': 'Administrator role updated successfully',
            'admin_id': str(admin.id),
            'new_role': new_role
        })
        
    except Exception as e:
        print(f"Error updating admin role: {str(e)}")
        traceback.print_exc()
        return Response({
            'error': f'Error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def change_admin_password(request):
    """Change an admin's password"""
    try:
        admin_id = request.data.get('admin_id')
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not admin_id or not current_password or not new_password:
            return Response({
                'error': 'Admin ID, current password, and new password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            admin = Admin.objects.get(id=admin_id)
        except Admin.DoesNotExist:
            return Response({
                'error': 'Administrator not found'
            }, status=status.HTTP_404_NOT_FOUND)
            
        # Verify current password
        if not check_password(current_password, admin.password_hash):
            return Response({
                'error': 'Current password is incorrect'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
        # Check if new password meets minimum requirements
        if len(new_password) < 8:
            return Response({
                'error': 'Password must be at least 8 characters long'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update password hash
        admin.password_hash = make_password(new_password)
        admin.save()
        
        return Response({
            'message': 'Password changed successfully'
        })
        
    except Exception as e:
        print(f"Error changing admin password: {str(e)}")
        traceback.print_exc()
        return Response({
            'error': f'Error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)