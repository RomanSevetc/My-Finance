from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'balance', 'gender', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ( 'birth_date', 'gender', 'balance')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)