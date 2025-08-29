# inventory_management/backend/api/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Item, Category, Supplier, Staff, StaffItemAssignment
from .serializers import (
    ItemSerializer, CategorySerializer, SupplierSerializer,
    StaffSerializer, StaffItemAssignmentSerializer
)
from .permissions import IsAdminOrReadOnly, IsAdminUser, IsStaffAssignmentOwnerOrAdmin

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
