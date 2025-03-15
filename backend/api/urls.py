from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'schools', views.SchoolViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.register_student, name='register-student'),
    path('verify-email/', views.verify_email, name='verify-email'),
] 