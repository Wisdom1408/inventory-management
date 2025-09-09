from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ItemViewSet, CategoryViewSet, SupplierViewSet,
    StaffViewSet, StaffItemAssignmentViewSet, UserViewSet
)

from .auth_views import (
    register, login, logout, password_reset_request, 
    password_reset_confirm, user_profile, login_view
)

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'items', ItemViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'staff', StaffViewSet)
router.register(r'assignments', StaffItemAssignmentViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),  # all routes go under /api/
    # Authentication endpoints
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/logout/', logout, name='logout'),
    path('auth/password-reset/', password_reset_request, name='password_reset_request'),
    path('auth/password-reset-confirm/', password_reset_confirm, name='password_reset_confirm'),
    path('auth/profile/', user_profile, name='user_profile'),
    path('auth/verify/', user_profile, name='verify'),  # Use user_profile as verify endpoint
]