from django.contrib import admin
from .models import Banner, Coupon, StaticPage


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ['title', 'position', 'sort_order', 'is_active']
    list_filter = ['position', 'is_active']


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_value', 'max_uses', 'used_count', 'is_active']
    list_filter = ['discount_type', 'is_active']


@admin.register(StaticPage)
class StaticPageAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'is_active']
    prepopulated_fields = {'slug': ('title',)}
