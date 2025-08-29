# inventory_management/backend/api/serializers.py
from rest_framework import serializers
from .models import Item, Category, Supplier, Staff, StaffItemAssignment

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

# ✅ Updated ItemSerializer to include purchase_price and notes
class ItemSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    supplier = SupplierSerializer(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        required=False
    )
    supplier_id = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(),
        source='supplier',
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Item
        fields = [
            'id', 'name', 'model', 'serial_number', 'tag_number',
            'date_of_purchase', 'purchase_price', 'notes',  # ✅ Added
            'supplier_id', 'category_id',
            'category', 'supplier',
            'created_at', 'updated_at'
        ]

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = ['id', 'name', 'email', 'department']

class StaffItemAssignmentSerializer(serializers.ModelSerializer):
    staff = StaffSerializer(read_only=True)
    item = ItemSerializer(read_only=True)
    
    staff_id = serializers.PrimaryKeyRelatedField(
        queryset=Staff.objects.all(), source='staff', write_only=True
    )
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all(), source='item', write_only=True
    )
    
    class Meta:
        model = StaffItemAssignment
        fields = ['id', 'staff', 'item', 'assigned_date', 'staff_id', 'item_id']
