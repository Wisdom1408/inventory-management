
# user_views.py
from django.contrib.auth.models import User
from rest_framework import viewsets, status
from rest_framework.response import Response
from .user_serializers import UserSerializer
from .permissions import IsOwnerOrAdmin

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
