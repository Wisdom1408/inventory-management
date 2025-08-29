from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from decimal import Decimal
from datetime import date
from api.models import Item, Category, Supplier, Staff, StaffItemAssignment

class CategoryModelTest(TestCase):
    def setUp(self):
        self.category = Category.objects.create(
            name="Electronics",
            description="Electronic devices and components"
        )

    def test_category_creation(self):
        self.assertEqual(self.category.name, "Electronics")
        self.assertEqual(str(self.category), "Electronics")

    def test_category_name_max_length(self):
        max_length = self.category._meta.get_field('name').max_length
        self.assertEqual(max_length, 200)

class SupplierModelTest(TestCase):
    def setUp(self):
        self.supplier = Supplier.objects.create(
            name="Tech Corp",
            contact_info="contact@techcorp.com"
        )

    def test_supplier_creation(self):
        self.assertEqual(self.supplier.name, "Tech Corp")
        self.assertEqual(str(self.supplier), "Tech Corp")

class StaffModelTest(TestCase):
    def setUp(self):
        self.staff = Staff.objects.create(
            name="John Doe",
            email="john.doe@company.com",
            department="IT"
        )

    def test_staff_creation(self):
        self.assertEqual(self.staff.name, "John Doe")
        self.assertEqual(self.staff.email, "john.doe@company.com")
        self.assertEqual(str(self.staff), "John Doe")

    def test_staff_email_unique(self):
        with self.assertRaises(IntegrityError):
            Staff.objects.create(
                name="Jane Doe",
                email="john.doe@company.com",  # Same email
                department="HR"
            )

class ItemModelTest(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Laptops")
        self.supplier = Supplier.objects.create(name="Dell Inc")
        
        self.item = Item.objects.create(
            name="Dell Laptop",
            model="Inspiron 15",
            serial_number="DL123456",
            tag_number="TAG001",
            date_of_purchase=date(2024, 1, 15),
            purchase_price=Decimal('999.99'),
            category=self.category,
            supplier=self.supplier,
            notes="High performance laptop"
        )

    def test_item_creation(self):
        self.assertEqual(self.item.name, "Dell Laptop")
        self.assertEqual(self.item.model, "Inspiron 15")
        self.assertEqual(self.item.purchase_price, Decimal('999.99'))
        self.assertEqual(str(self.item), "Dell Laptop")

    def test_item_serial_number_unique(self):
        with self.assertRaises(IntegrityError):
            Item.objects.create(
                name="Another Laptop",
                serial_number="DL123456",  # Same serial number
                category=self.category
            )

    def test_item_tag_number_unique(self):
        with self.assertRaises(IntegrityError):
            Item.objects.create(
                name="Another Laptop",
                tag_number="TAG001",  # Same tag number
                category=self.category
            )

class StaffItemAssignmentModelTest(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Laptops")
        self.staff = Staff.objects.create(
            name="John Doe",
            email="john@company.com",
            department="IT"
        )
        self.item = Item.objects.create(
            name="Test Laptop",
            category=self.category
        )
        
        self.assignment = StaffItemAssignment.objects.create(
            staff=self.staff,
            item=self.item
        )

    def test_assignment_creation(self):
        self.assertEqual(self.assignment.staff, self.staff)
        self.assertEqual(self.assignment.item, self.item)
        self.assertIsNotNone(self.assignment.assigned_date)
        expected_str = f"{self.item.name} assigned to {self.staff.name}"
        self.assertEqual(str(self.assignment), expected_str)

    def test_assignment_cascade_delete_staff(self):
        assignment_id = self.assignment.id
        self.staff.delete()
        with self.assertRaises(StaffItemAssignment.DoesNotExist):
            StaffItemAssignment.objects.get(id=assignment_id)

    def test_assignment_cascade_delete_item(self):
        assignment_id = self.assignment.id
        self.item.delete()
        with self.assertRaises(StaffItemAssignment.DoesNotExist):
            StaffItemAssignment.objects.get(id=assignment_id)
