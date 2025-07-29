from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('users.urls')),  # Маршруты пользователей
    path('api/', include('transactions.urls')),  # Маршруты транзакций
    path('', lambda request: HttpResponse('Welcome to My Finance API'), name='home'),  # Маршрут для /
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)