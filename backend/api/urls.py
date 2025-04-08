from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from django.http import JsonResponse

router = DefaultRouter()
router.register(r'schools', views.SchoolViewSet)
router.register(r'facultys', views.FacultyViewSet)
router.register(r'students', views.StudentViewSet)
router.register(r'events', views.EventViewSet)
router.register(r'classes', views.ClassViewSet)
router.register(r'attendance', views.AttendanceViewSet)
router.register(r'class-events', views.ClassEventViewSet)

# Simple database connection test endpoint
def db_connection_test(request):
    from django.db import connection
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
        
        return JsonResponse({
            "status": "success",
            "message": "Database connection successful",
            "result": result[0] == 1
        })
    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": "Database connection failed",
            "error": str(e)
        }, status=500)

urlpatterns = [
    path('', include(router.urls)),  # API Endpoints for all models
    path('student/register/', views.register_student, name='student-register'),
    path('faculty/register/', views.register_faculty, name='faculty-register'),
    path('verify-email/', views.verify_email, name='verify-email'),
    path('student/signin/', views.student_signin, name='student-signin'),
    path('faculty/signin/', views.faculty_signin, name='faculty-signin'),
    path('class/create/', views.create_class, name='create-class'),
    path('student/lookup/', views.lookup_student, name='lookup-student'),
    path('class/<int:pk>/update/', views.update_class, name='update-class'),
    path('event/<str:event_id>/qr/', views.generate_event_qr, name='generate-event-qr'),
    path('faculty/<uuid:pk>/update-profile/', views.update_faculty_profile, name='update-faculty-profile'),
    path('db-test/', db_connection_test, name='db-test'),
    path('attendance/event/<uuid:event_id>/class/<int:class_id>/', views.get_class_event_attendance, name='class-event-attendance'),
]
