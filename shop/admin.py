from django.contrib import admin
from django.db import transaction
from django.core.exceptions import PermissionDenied
from django.contrib import messages
from django.contrib.auth.admin import UserAdmin
from .models import Category, Product, ProductImage, Cart, CartItem, Order, OrderItem, NameUser, Review, SearchHistory

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ReviewInline(admin.TabularInline):
    model = Review
    extra = 0
    readonly_fields = ('user', 'rating', 'review', 'created_at')

class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline, ReviewInline]
    list_display = ('name', 'category', 'original_price', 'discount_percentage', 'discounted_price', 'total_sales', 'short_disc', 'short_desc', 'short_name')

    def total_sales(self, obj):
        return OrderItem.objects.filter(product=obj).count()

    total_sales.short_description = 'Total Sales Count'

    def delete_model(self, request, obj):
        try:
            with transaction.atomic():
                self.safe_delete(obj)
        except PermissionDenied as e:
            self.message_user(request, str(e), level=messages.ERROR)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            try:
                with transaction.atomic():
                    self.safe_delete(obj)
            except PermissionDenied as e:
                self.message_user(request, f"Could not delete {obj}: {str(e)}", level=messages.ERROR)

    def safe_delete(self, obj):
        cart_items = CartItem.objects.filter(product=obj)
        order_items = OrderItem.objects.filter(product=obj)
        reviews = Review.objects.filter(product=obj)

        if cart_items.exists():
            raise PermissionDenied(f"Cannot delete product '{obj}' as it's in {cart_items.count()} cart(s).")
        
        if order_items.exists():
            raise PermissionDenied(f"Cannot delete product '{obj}' as it's in {order_items.count()} order(s).")
        
        if reviews.exists():
            raise PermissionDenied(f"Cannot delete product '{obj}' as it has {reviews.count()} review(s).")

        obj.images.all().delete()
        obj.delete()

class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_items')

    def total_items(self, obj):
        return CartItem.objects.filter(cart=obj).count()

    total_items.short_description = 'Total Items in Cart'

class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'ordered_at', 'total_price', 'status', 'total_sales_amount', 'ordered_product_count']

    def total_sales_amount(self, obj):
        total_sales = sum(item.price * item.quantity for item in obj.items.all())
        return f"₹{total_sales}"

    total_sales_amount.short_description = 'Total Sales Amount'

    def ordered_product_count(self, obj):
        return sum(item.quantity for item in obj.items.all())

    ordered_product_count.short_description = 'Ordered Product Count'
    
class NameUserAdmin(UserAdmin):
    model = NameUser
    list_display = ['username', 'email', 'is_staff', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('phone_number',)}),
    )

admin.site.register(Category)
admin.site.register(Product, ProductAdmin)
admin.site.register(Cart, CartAdmin)
admin.site.register(CartItem)
admin.site.register(Order, OrderAdmin)
admin.site.register(OrderItem)
admin.site.register(NameUser, NameUserAdmin)
admin.site.register(Review)
admin.site.register(SearchHistory)