# inventory_management/backend/api/models.py
from django.db import models
from django.core.validators import MinValueValidator
from .validators import (
    validate_serial_number, validate_tag_number, validate_positive_price,
    validate_item_name, validate_supplier_name, validate_email_domain,
    validate_department_name
)

# This is a model for inventory items.
class Item(models.Model):
    name = models.CharField(
        max_length=200,
        validators=[validate_item_name],
        help_text="Item name (letters, numbers, spaces, and hyphens only)"
    )
    model = models.CharField(max_length=200, blank=True, null=True)
    serial_number = models.CharField(
        max_length=200, 
        unique=True, 
        blank=True, 
        null=True,
        validators=[validate_serial_number],
        help_text="Unique serial number"
    )
    tag_number = models.CharField(
        max_length=200, 
        unique=True, 
        blank=True, 
        null=True,
        validators=[validate_tag_number],
        help_text="Unique tag number"
    )
    date_of_purchase = models.DateField(blank=True, null=True)
    supplier = models.ForeignKey('Supplier', on_delete=models.SET_NULL, null=True, blank=True)
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True)
    
    purchase_price = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        blank=True, 
        null=True,
        validators=[MinValueValidator(0.01)],
        help_text="Purchase price must be greater than 0"
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['serial_number']),
            models.Index(fields=['tag_number']),
        ]
    
    def __str__(self):
        return self.name

# This is a model for item categories.
class Category(models.Model):
    name = models.CharField(
        max_length=200,
        unique=True,
        help_text="Category name must be unique"
    )
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name

# This is a model for suppliers.
class Supplier(models.Model):
    name = models.CharField(
        max_length=200,
        unique=True,
        validators=[validate_supplier_name],
        help_text="Supplier name must be unique"
    )
    contact_info = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

# This is a standalone staff profile model.
class Staff(models.Model):
    # This is a new field to store the staff member's name.
    name = models.CharField(max_length=200)
    email = models.EmailField(
        unique=True,
        validators=[validate_email_domain],
        help_text="Email must be unique"
    )
    department = models.CharField(
        max_length=100,
        validators=[validate_department_name]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['department']),
        ]

    def __str__(self):
        return self.name

# This model tracks which item is assigned to which staff member.
class StaffItemAssignment(models.Model):
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='assignments')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='assignments')
    assigned_date = models.DateField(auto_now_add=True)
    return_date = models.DateField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-assigned_date']
        unique_together = ['staff', 'item']  # Prevent duplicate assignments
        indexes = [
            models.Index(fields=['assigned_date']),
            models.Index(fields=['staff', 'assigned_date']),
        ]

    def __str__(self):
        return f"{self.item.name} assigned to {self.staff.name}"
