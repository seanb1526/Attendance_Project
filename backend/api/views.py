from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import School, Student
from .serializers import SchoolSerializer, StudentRegistrationSerializer
from django.conf import settings
import jwt
from datetime import datetime, timedelta
import os
import traceback
from django.core.mail import send_mail
from django.template.loader import render_to_string

class SchoolViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer

@api_view(['POST'])
def register_student(request):
    serializer = StudentRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        try:
            # Create student in the database
            student = serializer.save(email_verified=False)
            
            # Generate verification token
            token = jwt.encode({
                'student_id': str(student.id),
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, settings.SECRET_KEY, algorithm='HS256')
            
            # Create verification URL
            verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
            
            try:
                # Send email using Django's email backend
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
                
            except Exception as email_error:
                print(f"Error sending email: {str(email_error)}")
                traceback.print_exc()
            
            return Response({
                'message': 'Registration successful. Please check your email to verify your account.'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error in registration: {str(e)}")
            traceback.print_exc()
            return Response({
                'error': f'Registration error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def verify_email(request):
    token = request.GET.get('token')
    if not token:
        return Response({'error': 'No verification token provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Decode the token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        student_id = payload.get('student_id')
        
        # Find the student
        student = Student.objects.get(id=student_id)
        
        # Update verification status
        student.email_verified = True
        student.save()
        
        return Response({'message': 'Email verified successfully'})
    except jwt.ExpiredSignatureError:
        return Response({'error': 'Verification link has expired'}, status=status.HTTP_400_BAD_REQUEST)
    except jwt.InvalidTokenError:
        return Response({'error': 'Invalid verification token'}, status=status.HTTP_400_BAD_REQUEST)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error verifying email: {str(e)}")
        return Response({'error': 'An error occurred during verification'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def student_signin(request):
    email = request.data.get('email')
    student_id = request.data.get('student_id')
    
    try:
        # Find student by email
        student = Student.objects.get(email=email)
        
        # Verify student ID matches
        if student.student_id != student_id:
            return Response(
                {'error': 'Invalid student ID'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate verification token
        token = jwt.encode({
            'student_id': str(student.id),
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, settings.SECRET_KEY, algorithm='HS256')
        
        # Create verification URL
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        
        # Send verification email
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
        
        return Response({
            'message': 'Please check your email for the sign in link.'
        })
        
    except Student.DoesNotExist:
        return Response(
            {'error': 'No account found with this email'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print(f"Error in student signin: {str(e)}")
        return Response(
            {'error': 'An error occurred during sign in'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# settings.EMAIL_PORT = 465
# settings.EMAIL_USE_TLS = False
# settings.EMAIL_USE_SSL = True 