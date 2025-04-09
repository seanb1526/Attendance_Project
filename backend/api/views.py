from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import School, Student, Faculty, Event, Class, Attendance, ClassStudent, ClassEvent
from .serializers import SchoolSerializer, StudentRegistrationSerializer, FacultySerializer, EventSerializer, ClassSerializer, AttendanceSerializer, FacultyRegistrationSerializer, ClassEventSerializer, StudentSerializer
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

# ---------------- School ViewSet ----------------
class SchoolViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer

# ---------------- Student ViewSet ----------------
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

# ---------------- Register Student ----------------
@api_view(['POST'])
def register_student(request):
    # Validate request data
    serializer = StudentRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        # Create student with email_verified set to False
        student = serializer.save(email_verified=False)
        
        # Simply return the success response with the student ID
        return Response({
            'message': 'Registration successful.',
            'student_id': str(student.id)
        }, status=status.HTTP_201_CREATED)
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

# ---------------- Event ViewSet ----------------
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    
    def perform_update(self, serializer):
        # Ensure only the creator can update
        event = self.get_object()
        request_faculty_id = self.request.user.id  # If using token auth
        
        # For non-token auth, you might need to extract from query params or request data
        faculty_id = self.request.query_params.get('faculty_id')
        if not faculty_id:
            faculty_id = self.request.data.get('faculty')
        
        if str(event.faculty.id) != str(faculty_id):
            raise PermissionDenied("You don't have permission to edit this event")
        
        serializer.save()
    
    def perform_destroy(self, instance):
        # Ensure only the creator can delete
        request_faculty_id = self.request.query_params.get('faculty_id')
        if not request_faculty_id:
            request_faculty_id = self.request.data.get('faculty')
            
        if str(instance.faculty.id) != str(request_faculty_id):
            raise PermissionDenied("You don't have permission to delete this event")
        
        instance.delete()

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
            'school': faculty.school.id
        }
        
        serializer = ClassSerializer(data=class_data)
        if serializer.is_valid():
            new_class = serializer.save()
            
            # If students are provided, add them to the class
            student_ids = request.data.get('students', [])
            for student_id in student_ids:
                try:
                    student = Student.objects.get(id=student_id)
                    ClassStudent.objects.create(
                        class_instance=new_class,
                        student=student
                    )
                except Student.DoesNotExist:
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
        student = Student.objects.get(email=email)
        return Response({
            'id': str(student.id),
            'email': student.email,
            'first_name': student.first_name,
            'last_name': student.last_name,
            'student_id': student.student_id
        })
    except Student.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

# ---------------- Update Class ----------------
@api_view(['PUT'])
def update_class(request, pk):
    try:
        class_instance = Class.objects.get(pk=pk)
        
        # Update basic class information
        class_instance.name = request.data.get('name', class_instance.name)
        
        # Update description/metadata
        if 'description' in request.data:
            class_instance.description = request.data['description']
        
        class_instance.save()
        
        # Update students if provided
        if 'students' in request.data:
            # Remove existing student associations
            ClassStudent.objects.filter(class_instance=class_instance).delete()
            
            # Add new student associations
            student_ids = request.data.get('students', [])
            for student_id in student_ids:
                try:
                    student = Student.objects.get(id=student_id)
                    ClassStudent.objects.create(
                        class_instance=class_instance,
                        student=student
                    )
                except Student.DoesNotExist:
                    continue
        
        return Response({
            'message': 'Class updated successfully',
            'class': ClassSerializer(class_instance).data
        })
    except Class.DoesNotExist:
        return Response({'error': 'Class not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
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
    """Generate a QR code PDF for an event"""
    try:
        # Convert string to UUID if needed
        event_uuid = UUID(event_id)
        # Get the event
        event = Event.objects.get(pk=event_uuid)
        
        # Create event attendance URL - this will be the data in the QR code
        # We'll use a format like: /attend/{event_id}
        attendance_url = f"{settings.FRONTEND_URL}/attend/{event_id}"
        
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
        
        # Add event details to PDF
        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawString(1*inch, 10*inch, f"Event: {event.name}")
        pdf.setFont("Helvetica", 12)
        
        # Handle date formatting based on available fields
        if hasattr(event, 'start_time') and event.start_time:
            pdf.drawString(1*inch, 9.5*inch, f"Date: {event.start_time.strftime('%B %d, %Y')}")
            pdf.drawString(1*inch, 9.0*inch, f"Time: {event.start_time.strftime('%I:%M %p')} - {event.end_time.strftime('%I:%M %p')}")
        elif hasattr(event, 'date') and event.date:
            # If you're using a 'date' field instead of start_time/end_time
            pdf.drawString(1*inch, 9.5*inch, f"Date: {event.date.strftime('%B %d, %Y')}")
        
        # Add location if available
        if hasattr(event, 'location') and event.location:
            pdf.drawString(1*inch, 8.5*inch, f"Location: {event.location}")
        
        # Add instructions
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(1*inch, 8.0*inch, "Instructions:")
        pdf.setFont("Helvetica", 12)
        pdf.drawString(1*inch, 7.5*inch, "1. Print this QR code and display it in class")
        pdf.drawString(1*inch, 7.0*inch, "2. Have students scan this code with the ClassAttend app")
        pdf.drawString(1*inch, 6.5*inch, "3. Students must be logged in to record attendance")
        
        # Add QR code to PDF - FIX HERE
        # Convert BytesIO to PIL Image for reportlab
        img_pil = Image.open(img_buffer)
        pdf.drawInlineImage(img_pil, 2.5*inch, 2*inch, width=4*inch, height=4*inch)
        
        # Save PDF
        pdf.save()
        
        # Get the PDF value from the buffer
        buffer.seek(0)
        
        # Create the HTTP response with PDF content
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="event_{event_id}_qr.pdf"'
        
        return response
        
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Add this to backend/api/views.py
@api_view(['PUT'])
def update_faculty_profile(request, pk):
    """Update just the first and last name of a faculty member"""
    try:
        faculty = Faculty.objects.get(pk=pk)
        
        # Update only first name and last name
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

@api_view(['GET'])
def get_class_event_attendance(request, event_id, class_id):
    """
    Get attendance data for a specific event and class
    """
    try:
        # Check if the class exists
        class_instance = Class.objects.get(pk=class_id)
        
        # Check if the event exists
        event = Event.objects.get(pk=event_id)
        
        # Check if the faculty requesting is the owner of the class
        if request.user.is_authenticated and hasattr(request.user, 'faculty'):
            faculty = request.user.faculty
        else:
            # For development/testing, get faculty from query param
            faculty_id = request.query_params.get('faculty_id')
            if faculty_id:
                faculty = Faculty.objects.get(pk=faculty_id)
            else:
                return Response({"error": "Faculty authentication required"}, status=401)
        
        if class_instance.faculty.id != faculty.id:
            return Response({"error": "You do not have permission to access this data"}, status=403)
        
        # Get all students in the class
        class_students = ClassStudent.objects.filter(class_instance=class_instance)
        student_ids = [cs.student.id for cs in class_students]
        
        # Get attendance records for the event and these students
        attendance_records = Attendance.objects.filter(
            event=event,
            student__id__in=student_ids
        ).select_related('student')
        
        # Format the attendance data
        attendance_data = []
        for record in attendance_records:
            attendance_data.append({
                'student_id': record.student.id,
                'first_name': record.student.first_name,
                'last_name': record.student.last_name,
                'email': record.student.email,
                'student_id_number': record.student.student_id,
                'attended': True,
                'scanned_at': record.scanned_at
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