from django.db import models
from django.contrib.auth.models import User
import os

def image_upload_path(instance, filename):
    return os.path.join('product/' , filename)
    
def category_image_upload_path(instance, filename):
    return os.path.join('category/' , filename)

# Category Model
class Category(models.Model):
    name = models.CharField(max_length=255)
    image= models.ImageField(upload_to=category_image_upload_path)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name


# Product Model
class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    discount_percentage = models.DecimalField(max_digits=5,decimal_places=2,null=True)
    original_price = models.DecimalField(max_digits=10, decimal_places=2,null=True)
    main_image = models.ImageField(upload_to=image_upload_path)
    category = models.ForeignKey(Category, related_name='product', on_delete=models.CASCADE)
    trending_now = models.BooleanField(default=False)
    deals_of_the_day = models.BooleanField(default=False)
    short_desc= models.TextField(null=True)
    short_disc= models.TextField(null=True)
    short_name=models.TextField(null=True)
    stock = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def discounted_price(self):
        if self.discount_percentage > 0:
            discount_amount = (self.original_price * self.discount_percentage) / 100
            return self.original_price - discount_amount
        return self.original_price  

    
    def average_rating(self):
        reviews = self.reviews.all()
        if reviews:
            return sum([review.rating for review in reviews]) / len(reviews)
        return 0

    def number_of_reviews(self):
        return self.reviews.count() 
     
    def __str__(self):
        return self.name


# ProductImage Model (For Thumbnails)
class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/')
    is_thumbnail = models.BooleanField(default=False)

    def __str__(self):
        return f"Thumbnail for {self.product.name}"


# Cart Model
class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart of {self.user.username}"


#  CartItem Model
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} of {self.product.name}"


# Order Model
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    ordered_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=255, default='Pending')

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"


# OrderItem Model
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} of {self.product.name} in Order {self.order.id}"

# search histoy model 
class SearchHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    query = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Search Query: {self.query} by {self.user.username if self.user else 'Anonymous'}"
        
# Review model

class Review(models.Model):
    RATING_OPTIONS = [(i, str(i)) for i in range(1, 6)] 

    product = models.ForeignKey(Product, related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE) 
    review = models.TextField(blank=True, null=True)
    rating = models.IntegerField(choices=RATING_OPTIONS)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.rating} stars"