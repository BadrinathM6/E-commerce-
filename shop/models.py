from django.db import models
import os
from django.contrib.auth.models import AbstractUser
from django.forms import ValidationError
from django.utils import timezone
from django.conf import settings
from cloudinary.models import CloudinaryField

def image_upload_path(instance, filename):
    return os.path.join('product/', filename)
    
def category_image_upload_path(instance, filename):
    return os.path.join('category/', filename)

# User Model
class NameUser(AbstractUser):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    full_name = models.CharField(max_length=255, blank=True)
   
    def __str__(self):
        return self.username

# Category Model
class Category(models.Model):
    name = models.CharField(max_length=255)
    image = CloudinaryField('image')
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name
    
class Wishlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

# Product Model
class Product(models.Model):
    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField()
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    main_image = CloudinaryField('image') 
    category = models.ForeignKey(Category, related_name='product', on_delete=models.CASCADE)
    trending_now = models.BooleanField(default=False)
    deals_of_the_day = models.BooleanField(default=False)
    short_desc = models.TextField(null=True)
    short_disc = models.TextField(null=True)
    short_name = models.TextField(null=True)
    stock = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def discounted_price(self):
        if self.discount_percentage and self.discount_percentage > 0:
            discount_amount = (self.original_price * self.discount_percentage) / 100
            return self.original_price - discount_amount
        return self.original_price  

    @property
    def average_rating(self):
        reviews = self.reviews.all()
        if reviews:
            return sum([review.rating for review in reviews]) / len(reviews)
        return 0
    
    @property
    def number_of_reviews(self):
        return self.reviews.count() 
     
    def __str__(self):
        return self.name
    
# ProductImage Model (For Thumbnails)
class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE, null=True, blank=True)
    image = CloudinaryField('image') 
    is_thumbnail = models.BooleanField(default=False)

    def __str__(self):
        return f"Thumbnail for {self.product.name}" if self.product else "Thumbnail without product reference"

# Other models remain the same but with updated user references
class Cart(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart of {self.user.username}" if self.user else "Cart without user"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} of {self.product.name}"
    
class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_address = models.CharField(max_length=500)
    ordered_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=255, default='Pending')

    def clean(self):
        if not self.user_id:
            raise ValidationError({'user': 'User is required'})
        
        for item in self.items.all():
            if item.product and not Product.objects.filter(id=item.product_id).exists():
                raise ValidationError({'items': f'Product with id {item.product_id} does not exist'})

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"
    
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} of {self.product.name if self.product else 'Deleted product'} in Order {self.order.id}"

class SearchHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    query = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Search Query: {self.query} by {self.user.username if self.user else 'Anonymous'}"

class Review(models.Model):
    RATING_OPTIONS = [(i, str(i)) for i in range(1, 6)] 

    product = models.ForeignKey(Product, related_name='reviews', on_delete=models.PROTECT)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE) 
    review = models.TextField(blank=True, null=True)
    rating = models.IntegerField(choices=RATING_OPTIONS)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.rating} stars"

class SavedAddress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_addresses')
    full_name = models.CharField(max_length=255)
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.full_name}, {self.address_line1}, {self.city}"
    
class PaymentOrder(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    order = models.ForeignKey('shop.Order', on_delete=models.CASCADE)
    razorpay_order_id = models.CharField(max_length=100)
    razorpay_payment_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_signature = models.CharField(max_length=200, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    status = models.CharField(max_length=20, default='created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment for Order {self.order.id}"