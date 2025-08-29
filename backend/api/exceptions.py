from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.db import IntegrityError
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides more detailed error responses.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Log the exception
    logger.error(f"API Exception: {exc}", exc_info=True)
    
    if response is not None:
        # Customize the response data
        custom_response_data = {
            'error': True,
            'message': 'An error occurred',
            'details': response.data,
            'status_code': response.status_code
        }
        
        # Handle specific error types
        if response.status_code == 400:
            custom_response_data['message'] = 'Bad request - please check your input'
        elif response.status_code == 401:
            custom_response_data['message'] = 'Authentication required'
        elif response.status_code == 403:
            custom_response_data['message'] = 'Permission denied'
        elif response.status_code == 404:
            custom_response_data['message'] = 'Resource not found'
        elif response.status_code == 405:
            custom_response_data['message'] = 'Method not allowed'
        elif response.status_code >= 500:
            custom_response_data['message'] = 'Internal server error'
            # Don't expose internal error details in production
            if hasattr(context.get('request'), 'user') and not context['request'].user.is_staff:
                custom_response_data['details'] = 'An internal error occurred. Please contact support.'
        
        response.data = custom_response_data
    else:
        # Handle exceptions not caught by DRF
        if isinstance(exc, ValidationError):
            response = Response({
                'error': True,
                'message': 'Validation error',
                'details': exc.message_dict if hasattr(exc, 'message_dict') else str(exc),
                'status_code': 400
            }, status=status.HTTP_400_BAD_REQUEST)
        
        elif isinstance(exc, IntegrityError):
            response = Response({
                'error': True,
                'message': 'Database integrity error',
                'details': 'This operation would violate database constraints',
                'status_code': 400
            }, status=status.HTTP_400_BAD_REQUEST)
        
        else:
            # Generic server error
            response = Response({
                'error': True,
                'message': 'Internal server error',
                'details': 'An unexpected error occurred',
                'status_code': 500
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return response

class APIException(Exception):
    """
    Custom API exception class
    """
    def __init__(self, message, status_code=400, details=None):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)

class ValidationException(APIException):
    """
    Custom validation exception
    """
    def __init__(self, message, details=None):
        super().__init__(message, 400, details)

class PermissionException(APIException):
    """
    Custom permission exception
    """
    def __init__(self, message="Permission denied", details=None):
        super().__init__(message, 403, details)

class NotFoundException(APIException):
    """
    Custom not found exception
    """
    def __init__(self, message="Resource not found", details=None):
        super().__init__(message, 404, details)
