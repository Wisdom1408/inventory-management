# inventory_management/backend/api/views.py
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from .models import Item, Category, Supplier, Staff, StaffItemAssignment
from .serializers import (
    ItemSerializer, CategorySerializer, SupplierSerializer,
    StaffSerializer, StaffItemAssignmentSerializer,UserSerializer
)
from .permissions import IsAdminOrReadOnly, IsAdminUser, IsStaffAssignmentOwnerOrAdmin,IsOwnerOrAdmin
from django.contrib.auth.models import User
from rest_framework.response import Response

class CategoryViewSet(viewsets.ModelViewSet):
    """
    Provides all CRUD operations for the Category model.
    Only admins can create/update/delete, authenticated users can read.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

class SupplierViewSet(viewsets.ModelViewSet):
    """
    Provides all CRUD operations for the Supplier model.
    Only admins can create/update/delete, authenticated users can read.
    """
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAdminOrReadOnly]

class ItemViewSet(viewsets.ModelViewSet):
    """
    Provides all CRUD operations for the Item model.
    Only admins can create/update/delete, authenticated users can read.
    """
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [IsAdminOrReadOnly]

# New viewsets for staff and item assignments
class StaffViewSet(viewsets.ModelViewSet):
    """
    Provides all CRUD operations for the Staff model.
    Only admins can manage staff records.
    """
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    permission_classes = [IsAdminUser]

class StaffItemAssignmentViewSet(viewsets.ModelViewSet):
    """
    Provides all CRUD operations for the StaffItemAssignment model.
    Staff can view their own assignments, admins can manage all.
    """
    queryset = StaffItemAssignment.objects.all()
    serializer_class = StaffItemAssignmentSerializer
    permission_classes = [IsStaffAssignmentOwnerOrAdmin]
    
    def get_queryset(self):
        """
        Filter assignments based on user role.
        """
        queryset = StaffItemAssignment.objects.all()
        
        # If user is admin, return all assignments
        if self.request.user.is_staff:
            return queryset
        
        # If regular user, only return their assignments
        try:
            staff = Staff.objects.get(email=self.request.user.email)
            return queryset.filter(staff=staff)
        except Staff.DoesNotExist:
            return queryset.none()

# user_views.py

class UserViewSet(viewsets.ModelViewSet):
    """
    Provides CRUD operations for the User model.
    Users can edit their own profile, admins can manage all users.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsOwnerOrAdmin]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
