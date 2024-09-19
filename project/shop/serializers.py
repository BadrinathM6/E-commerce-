from rest_framework import serializers
from .models import Category, Product, SearchHistory

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image']

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'discount_price', 'main_image', 'category', 'trending_now', 'deals_of_the_day', 'stock', 'created_at', 'updated_at']

class SearchHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchHistory
        fields = ['id', 'user', 'query', 'created_at']
