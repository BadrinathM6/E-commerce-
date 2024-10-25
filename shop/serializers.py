from rest_framework import serializers
import urllib.parse
from django.contrib.auth import get_user_model
from .models import NameUser, Category, Product, ProductImage, Cart, CartItem, Order, OrderItem, SearchHistory, Review, SavedAddress, Wishlist, PaymentOrder

# User Serializer

NameUser = get_user_model()

class NameUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = NameUser
        fields = ['id', 'username', 'email', 'full_name', 'date_joined', 'phone_number', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = NameUser.objects.create_user(**validated_data)
        return user

    def validate_username(self, value):
        if NameUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        if NameUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value
    
    def validate_phone_number(self, value):
        if value and NameUser.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("This phone number is already in use.")
        return value



# Category Serializer
class CategorySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'image_url', 'slug']

    def get_image_url(self, obj):
        if not obj.image:
            return None
            
        # Get the raw URL string
        url = obj.image.url
        
        # Check if it's a Cloudinary URL
        if 'cloudinary.com' in url:
            # Extract the Cloudinary URL
            try:
                # Find the position of the actual Cloudinary URL
                cloudinary_start = url.find('https://', url.find('cloudinary.com') - 8)
                if cloudinary_start != -1:
                    url = url[cloudinary_start:]
                    # Clean up the URL
                    url = url.replace('\n', '').strip()
                    return url
            except Exception as e:
                print(f"Error processing Cloudinary URL: {e}")
                return url
                
        return url

# Product Serializer
class ProductSerializer(serializers.ModelSerializer):
    discounted_price = serializers.ReadOnlyField() 
    average_rating = serializers.ReadOnlyField()
    number_of_reviews = serializers.ReadOnlyField()
    main_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'discount_percentage', 'original_price', 'main_image', 
            'category', 'trending_now', 'deals_of_the_day', 'short_desc', 'short_disc', 'short_name', 
            'stock', 'created_at', 'updated_at', 'discounted_price', 'average_rating', 'number_of_reviews'
        ]

    def get_main_image(self, obj):
        if obj.main_image:
            return obj.main_image.url
        return None

class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'created_at']

# Product Image Serializer (For Thumbnails)
class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'product', 'image', 'is_thumbnail']

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None



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
class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.CharField(source='product.name')
    
    class Meta:
        model = OrderItem
        fields = ['product', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'ordered_at', 'status', 'total_price', 'shipping_address', 'items']


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

class SavedAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedAddress
        fields = ['id', 'full_name', 'address_line1', 'address_line2', 'city', 'state', 'zip_code', 'country']


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = NameUser
        fields = ['full_name', 'email', 'phone_number']
        
    def validate_email(self, value):
        user = self.instance
        if value != user.email:
            if NameUser.objects.filter(email=value).exists():
                raise serializers.ValidationError("This email is already in use.")
        return value
        
    def validate_phone_number(self, value):
        user = self.instance
        if value and value != user.phone_number:
            if NameUser.objects.filter(phone_number=value).exists():
                raise serializers.ValidationError("This phone number is already in use.")
        return value
    
from rest_framework import serializers
from .models import PaymentOrder

class PaymentOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentOrder
        fields = ['id', 'razorpay_order_id', 'amount', 'currency', 'status']