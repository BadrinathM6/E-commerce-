from rest_framework import serializers
from .models import NameUser, Category, Product, ProductImage, Cart, CartItem, Order, OrderItem, SearchHistory, Review
from django.contrib.auth import get_user_model

# User Serializer
class NameUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model() 
        fields = ['id', 'username', 'email', 'phone_number', 'date_joined', 'last_login', 'is_active', 'is_staff']


# Category Serializer
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'image_url', 'slug']


# Product Serializer
class ProductSerializer(serializers.ModelSerializer):
    discounted_price = serializers.ReadOnlyField() 
    average_rating = serializers.ReadOnlyField()
    number_of_reviews = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'discount_percentage', 'original_price', 'main_image', 
            'category', 'trending_now', 'deals_of_the_day', 'short_desc', 'short_disc', 'short_name', 
            'stock', 'created_at', 'updated_at', 'discounted_price', 'average_rating', 'number_of_reviews'
        ]


# Product Image Serializer (For Thumbnails)
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'product', 'image', 'is_thumbnail']


# Cart Serializer
class CartSerializer(serializers.ModelSerializer):
    user = NameUserSerializer(read_only=True)  

    class Meta:
        model = Cart
        fields = ['id', 'user', 'created_at']


# CartItem Serializer
class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True) 

    class Meta:
        model = CartItem
        fields = ['id', 'cart', 'product', 'quantity']


# Order Serializer
class OrderSerializer(serializers.ModelSerializer):
    user = NameUserSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'total_price', 'ordered_at', 'status']


# OrderItem Serializer
class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True) 

    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'product', 'quantity', 'price']


# Search History Serializer
class SearchHistorySerializer(serializers.ModelSerializer):
    user = NameUserSerializer(read_only=True)

    class Meta:
        model = SearchHistory
        fields = ['id', 'user', 'query', 'created_at']


# Review Serializer
class ReviewSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    user = NameUserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'product', 'user', 'review', 'rating', 'created_at']