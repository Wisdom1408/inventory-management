from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
import re
from decimal import Decimal

def validate_serial_number(value):
    """
    Validate serial number format - alphanumeric with optional hyphens/underscores
    """
    if not re.match(r'^[A-Za-z0-9_-]+$', value):
        raise ValidationError(
            'Serial number must contain only letters, numbers, hyphens, and underscores.'
        )

def validate_tag_number(value):
    """
    Validate tag number format - alphanumeric with optional hyphens
    """
    if not re.match(r'^[A-Za-z0-9-]+$', value):
        raise ValidationError(
            'Tag number must contain only letters, numbers, and hyphens.'
        )

def validate_positive_price(value):
    """
    Validate that price is positive
    """
    if value is not None and value <= 0:
        raise ValidationError('Price must be greater than zero.')

def validate_email_domain(value):
    """
    Validate email domain (can be customized for company domains)
    """
    if not value:
        return
    
    # Basic email validation
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, value):
        raise ValidationError('Enter a valid email address.')

def validate_department_name(value):
    """
    Validate department name format
    """
    if not re.match(r'^[A-Za-z\s&-]+$', value):
        raise ValidationError(
            'Department name must contain only letters, spaces, ampersands, and hyphens.'
        )

def validate_item_name(value):
    """
    Validate item name - no special characters except spaces and hyphens
    """
    if not re.match(r'^[A-Za-z0-9\s-]+$', value):
        raise ValidationError(
            'Item name must contain only letters, numbers, spaces, and hyphens.'
        )

def validate_supplier_name(value):
    """
    Validate supplier name format
    """
    if not re.match(r'^[A-Za-z0-9\s&.,()-]+$', value):
        raise ValidationError(
            'Supplier name contains invalid characters.'
        )

# Regex validators for common patterns
phone_regex = RegexValidator(
    regex=r'^\+?1?\d{9,15}$',
    message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
)

postal_code_regex = RegexValidator(
    regex=r'^[A-Za-z0-9\s-]{3,10}$',
    message="Enter a valid postal code."
)
