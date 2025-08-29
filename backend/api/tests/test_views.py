from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from api.models import Item, Category, Supplier, Staff, StaffItemAssignment
from decimal import Decimal

class BaseAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create test users
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='testpass123',
            is_staff=True
        )
        self.regular_user = User.objects.create_user(
            username='user',
            email='user@test.com',
            password='testpass123'
        )
        
        # Create tokens
        self.admin_token = Token.objects.create(user=self.admin_user)
        self.user_token = Token.objects.create(user=self.regular_user)
        
        # Create test data
        self.category = Category.objects.create(name="Test Category")
        self.supplier = Supplier.objects.create(name="Test Supplier")
        self.staff = Staff.objects.create(
            name="Test Staff",
            email="staff@test.com",
            department="IT"
        )
        self.item = Item.objects.create(
            name="Test Item",
            category=self.category,
            supplier=self.supplier
        )

class AuthenticationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }

    def test_user_registration(self):
        response = self.client.post('/api/auth/register/', self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertTrue(User.objects.filter(username='testuser').exists())

    def test_user_login(self):
        # Create user first
        User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post('/api/auth/login/', login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_invalid_login(self):
        login_data = {
            'username': 'nonexistent',
            'password': 'wrongpass'
        }
        response = self.client.post('/api/auth/login/', login_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class CategoryViewSetTestCase(BaseAPITestCase):
    def test_list_categories_authenticated(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.user_token.key}')
        response = self.client.get('/api/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_categories_unauthenticated(self):
        response = self.client.get('/api/categories/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_category_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        data = {'name': 'New Category', 'description': 'Test description'}
        response = self.client.post('/api/categories/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_category_regular_user(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.user_token.key}')
        data = {'name': 'New Category', 'description': 'Test description'}
        response = self.client.post('/api/categories/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

class ItemViewSetTestCase(BaseAPITestCase):
    def test_list_items_authenticated(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.user_token.key}')
        response = self.client.get('/api/items/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_item_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        data = {
            'name': 'New Item',
            'category': self.category.id,
            'supplier': self.supplier.id
        }
        response = self.client.post('/api/items/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_item_regular_user(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.user_token.key}')
        data = {
            'name': 'New Item',
            'category': self.category.id
        }
        response = self.client.post('/api/items/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

class StaffViewSetTestCase(BaseAPITestCase):
    def test_list_staff_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.get('/api/staff/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_staff_regular_user(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.user_token.key}')
        response = self.client.get('/api/staff/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

class StaffItemAssignmentTestCase(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.assignment = StaffItemAssignment.objects.create(
            staff=self.staff,
            item=self.item
        )

    def test_list_assignments_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        response = self.client.get('/api/assignments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_create_assignment_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token.key}')
        new_item = Item.objects.create(name="Another Item", category=self.category)
        data = {
            'staff': self.staff.id,
            'item': new_item.id
        }
        response = self.client.post('/api/assignments/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
