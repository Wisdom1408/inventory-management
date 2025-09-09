from django import views
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # all API routes live in api/urls.py
]

# Add API documentation URLs if drf_spectacular is available
try:
    from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
    urlpatterns += [
        path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
        path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
        path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
        path('auth/login/', views.login_view, name='login'),
        path('auth/register/', views.register_view, name='register'),
        path('auth/logout/', views.logout_view, name='logout'),
        path('auth/verify/', views.verify_token, name='verify'),
    ]
except ImportError:
    pass
