from django.contrib import admin
from .models import Category, Product, ProductImage, Cart, CartItem, Order, OrderItem

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]
    list_display = ('name', 'category', 'original_price', 'discount_percentage', 'discounted_price', 'total_sales') 

    def total_sales(self, obj):
        total_sales_count = OrderItem.objects.filter(product=obj).count()
        return total_sales_count

    total_sales.short_description = 'Total Sales Count' 

class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_items')

    def total_items(self, obj):
        total_items_count = CartItem.objects.filter(cart=obj).count()
        return total_items_count

    total_items.short_description = 'Total Items in Cart'

class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'ordered_at', 'total_price', 'status']

    def total_sales_amount(self, obj):
        total_sales = sum(item.price * item.quantity for item in OrderItem.objects.filter(order=obj))
        return f"₹{total_sales}"  

    total_sales_amount.short_description = 'Total Sales Amount'

    def ordered_product_count(self, obj):
        total_count = sum(item.quantity for item in OrderItem.objects.filter(order=obj))
        return total_count

    ordered_product_count.short_description = 'Ordered Product Count'

admin.site.register(Category)
admin.site.register(Product, ProductAdmin)
admin.site.register(Cart, CartAdmin)
admin.site.register(CartItem)
admin.site.register(Order, OrderAdmin)
admin.site.register(OrderItem)
