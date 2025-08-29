from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit objects.
    Regular users can only read.
    """
    
    def has_permission(self, request, view):
        # Read permissions are allowed for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Write permissions are only allowed to admin users
        return request.user and request.user.is_authenticated and request.user.is_staff

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow users to edit their own data or admins to edit any data.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Write permissions for owner or admin
        if hasattr(obj, 'user'):
            return obj.user == request.user or request.user.is_staff
        
        # For User objects, check if it's the same user or admin
        if hasattr(obj, 'username'):
            return obj == request.user or request.user.is_staff
        
        # Default to admin only
        return request.user.is_staff

class IsStaffAssignmentOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission for staff item assignments.
    Staff can view their own assignments, admins can manage all.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Admins can do anything
        if request.user.is_staff:
            return True
        
        # Staff can only view their own assignments
        if request.method in permissions.SAFE_METHODS:
            # Check if the user has a corresponding Staff record
            from .models import Staff
            try:
                staff = Staff.objects.get(email=request.user.email)
                return obj.staff == staff
            except Staff.DoesNotExist:
                return False
        
        # Only admins can create/update/delete assignments
        return False
