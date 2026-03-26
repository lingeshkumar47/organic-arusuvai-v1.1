from django.contrib import admin
from .models import User, Address


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'role', 'phone', 'is_active']
    list_filter = ['role', 'is_active']
    search_fields = ['email', 'username', 'phone']


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'label', 'full_name', 'city', 'pincode', 'is_default']
    list_filter = ['city']
