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
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Count
from datetime import datetime, timezone as dt_timezone
from django.utils import timezone

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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Returns aggregated statistics for the dashboard.
    Accepts optional ISO date params: startDate, endDate
    """
    def parse_iso(dt_str):
      try:
        if not dt_str:
            return None
        s = dt_str.strip()
        if s.endswith('Z'):
            s = s.replace('Z', '+00:00')
        dt = datetime.fromisoformat(s)
        if timezone.is_naive(dt):
            dt = dt.replace(tzinfo=dt_timezone.utc)
        return dt
      except Exception:
        return None

    start_dt = parse_iso(request.query_params.get('startDate'))
    end_dt = parse_iso(request.query_params.get('endDate'))

    items_qs = Item.objects.all()
    staff_qs = Staff.objects.all()
    assignments_qs = StaffItemAssignment.objects.all()

    if start_dt and end_dt:
        assignments_qs = assignments_qs.filter(created_at__range=(start_dt, end_dt))
    elif start_dt:
        assignments_qs = assignments_qs.filter(created_at__gte=start_dt)
    elif end_dt:
        assignments_qs = assignments_qs.filter(created_at__lte=end_dt)

    total_items = items_qs.count()
    current_assigned = StaffItemAssignment.objects.filter(return_date__isnull=True).count()
    available_items = max(total_items - current_assigned, 0)
    total_staff = staff_qs.count()

    items_by_category_qs = Item.objects.values('category__name').annotate(count=Count('id'))
    items_by_category = {}
    for row in items_by_category_qs:
        key = row['category__name'] or 'Uncategorized'
        items_by_category[key] = row['count']

    assignments_by_dept_qs = StaffItemAssignment.objects.filter(return_date__isnull=True).values('staff__department').annotate(count=Count('id'))
    assignments_by_department = {}
    for row in assignments_by_dept_qs:
        key = row['staff__department'] or 'Unknown'
        assignments_by_department[key] = row['count']

    recent_qs = assignments_qs.select_related('item', 'staff').order_by('-created_at')[:10]
    recent_activity = [
        {
            'id': a.id,
            'description': f"{a.item.name} assigned to {a.staff.name}",
            'timestamp': a.created_at,
        }
        for a in recent_qs
    ]

    return Response({
        'totalItems': total_items,
        'assignedItems': current_assigned,
        'availableItems': available_items,
        'totalStaff': total_staff,
        'recentActivity': recent_activity,
        'itemsByCategory': items_by_category,
        'assignmentsByDepartment': assignments_by_department,
    })
