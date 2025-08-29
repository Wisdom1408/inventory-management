from django.contrib import admin
from .models import Category, Supplier, Item, Staff, StaffItemAssignment

# Register your models to make them visible in the admin panel
admin.site.register(Category)
admin.site.register(Supplier)
admin.site.register(Item)
admin.site.register(Staff)
admin.site.register(StaffItemAssignment)
