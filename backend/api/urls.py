from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from django.http import JsonResponse

router = DefaultRouter()
router.register(r'schools', views.SchoolViewSet)
router.register(r'students', views.StudentViewSet)
router.register(r'faculty', views.FacultyViewSet)
router.register(r'events', views.EventViewSet)
router.register(r'classes', views.ClassViewSet)
router.register(r'attendance', views.AttendanceViewSet)
router.register(r'class-events', views.ClassEventViewSet)
router.register(r'class-students', views.ClassStudentViewSet)
router.register(r'pending-students', views.PendingStudentViewSet)
router.register(r'admins', views.AdminViewSet)

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
    path('', include(router.urls)),
    # Custom endpoints first (before router.urls)
    path('student/register/', views.register_student, name='student-register'),
    path('faculty/register/', views.register_faculty, name='faculty-register'),
    path('verify-email/', views.verify_email, name='verify-email'),
    path('student/signin/', views.student_signin, name='student-signin'),
    path('student/direct-signin/', views.student_direct_signin, name='student-direct-signin'),
    path('faculty/signin/', views.faculty_signin, name='faculty-signin'),  # Make sure this appears before router.urls
    path('class/create/', views.create_class, name='create-class'),
    path('class/<uuid:pk>/update/', views.update_class, name='update-class'),
    path('look-up-student/', views.lookup_student, name='lookup-student'),
    path('faculty/add-student/', views.faculty_add_student, name='faculty-add-student'),
    path('events/<uuid:event_id>/generate-qr/', views.generate_event_qr, name='generate-event-qr'),
    path('faculty/<uuid:pk>/update/', views.update_faculty_profile, name='update-faculty-profile'),
    path('events/<uuid:event_id>/class/<uuid:class_id>/attendance/', views.get_class_event_attendance, name='class-event-attendance'),
    path('students/<uuid:pk>/delete/', views.delete_student_account, name='delete-student-account'),
    path('students/<uuid:student_id>/attendance/', views.get_student_attendance, name='student-attendance'),
    
    # Admin endpoints
    path('admin/register/', views.admin_register, name='admin-register'),
    path('admin/signin/', views.admin_signin, name='admin-signin'),
    path('admin/profile/<uuid:pk>/', views.admin_profile, name='admin-profile'),
    path('admin/stats/', views.admin_stats, name='admin-stats'),
    path('admin/recent-activity/', views.admin_recent_activity, name='admin-recent-activity'),
    path('admin/faculty-by-school/', views.get_faculty_by_school, name='faculty-by-school'),
    path('admin/promote-faculty/', views.promote_faculty_to_admin, name='promote-faculty'),
    path('admin/update-role/', views.update_admin_role, name='update-admin-role'),
    path('admin/change-password/', views.change_admin_password, name='change-admin-password'),
]
