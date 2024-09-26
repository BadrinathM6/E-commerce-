from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from django.http import JsonResponse
from .models import Category, Product, Cart, CartItem, Order, OrderItem, SearchHistory, Review

def home(request):
    trending_products = Product.objects.filter(trending_now=True)[:4]
    deal_products = Product.objects.filter(deals_of_the_day=True)[:3]
    categories = Category.objects.all()
    return render(request, 'shop/home.html', {
        'categories': categories,
        'trending_products': trending_products,
        'deal_products': deal_products,
    })

def product_list(request):
    products = Product.objects.all()
    category_id = request.GET.get('category')
    search_query = request.GET.get('q')

    if category_id:
        products = products.filter(category_id=category_id)
    
    if search_query:
        products = products.filter(
            Q(name__icontains=search_query) | Q(description__icontains=search_query)
        )
        
        # Save search history
        if request.user.is_authenticated:
            SearchHistory.objects.create(user=request.user, query=search_query)
        else:
            SearchHistory.objects.create(query=search_query)

    categories = Category.objects.all()
    rating_range = range(1, 6)
    return render(request, 'shop/product_list.html', {
        'products': products,
        'categories': categories,
        'current_category': category_id,
        'search_query': search_query,
        'rating_range': rating_range,
    })

def product_detail(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    rating_range = range(1, 6)
    similar_products = Product.objects.filter(category=product.category).exclude(id=product.id)
    
    if similar_products.count() < 3:
        remaining_count = 3 - similar_products.count()
        other_products = Product.objects.exclude(Q(category=product.category) | Q(id=product.id))[:remaining_count]
        similar_products = list(similar_products) + list(other_products)
    else:
        similar_products = similar_products[:7]
    
    description_points = product.description.split("*")
    
    context = {
        'product': product,
        'similar_products': similar_products,
        'description_points': description_points,
        'rating_range': rating_range,
    }
    return render(request, 'shop/product_detail.html', context)
    

@login_required
def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    cart, created = Cart.objects.get_or_create(user=request.user)
    cart_item, item_created = CartItem.objects.get_or_create(cart=cart, product=product)
    
    if not item_created:
        cart_item.quantity += 1
        cart_item.save()
    
    messages.success(request, f"{product.name} added to cart.")
    return redirect('product_list')

@login_required
def view_cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    cart_items = cart.items.all()
    total = sum(item.product.price * item.quantity for item in cart_items)
    return render(request, 'cart.html', {'cart_items': cart_items, 'total': total})

@login_required
def checkout(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    cart_items = cart.items.all()
    total = sum(item.product.price * item.quantity for item in cart_items)
    
    if request.method == 'POST':
        order = Order.objects.create(user=request.user, total_price=total)
        for item in cart_items:
            OrderItem.objects.create(order=order, product=item.product, quantity=item.quantity, price=item.product.price)
        cart_items.delete()
        messages.success(request, "Order placed successfully!")
        return redirect('order_confirmation', order_id=order.id)
    
    return render(request, 'checkout.html', {'cart_items': cart_items, 'total': total})

@login_required
def order_confirmation(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    return render(request, 'order_confirmation.html', {'order': order})

def search(request):
    query = request.GET.get('q')
    if query:
        return redirect('product_list') + f"?q={query}"
    return redirect('home')

def search_suggestions(request):
    query = request.GET.get('q', '').strip()
    suggestions = []

    # Allow single-character searches
    if query:
        # Filter products based on the query
        suggestions = Product.objects.filter(short_name__icontains=query).values_list('short_name', flat=True)[:10]  # Get top 10 matches

    return JsonResponse(list(suggestions), safe=False)

@login_required
def search_history(request):
    history = SearchHistory.objects.filter(user=request.user).order_by('-created_at')[:5]
    history_list = [entry.query for entry in history]
    return JsonResponse(history_list, safe=False)
    
@login_required
def submit_review(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    
    if request.method == "POST":
        review_text = request.POST.get('review')
        rating = int(request.POST.get('rating'))

        existing_review = Review.objects.filter(product=product, user=request.user).first()

        if existing_review:
            messages.error(request, "You have already submitted a review for this product.")
            return redirect('product_detail', product_id=product.id)
        
        new_review = Review.objects.create(
            product=product,
            user=request.user,
            review_text=review_text,
            rating=rating
        )
        new_review.save()
        messages.success(request, "Thank you for the review !")
        return redirect('product_detail', product_id=product.id)

    return redirect('product_detail', product_id=product.id)
    
# API views for DRF

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Category, Product, SearchHistory
from .serializers import CategorySerializer, ProductSerializer, SearchHistorySerializer


class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.all()
        category_id = self.request.GET.get('category')
        search_query = self.request.GET.get('q')

        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) | Q(description__icontains=search_query)
            )
        return queryset

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()

class SearchHistoryView(generics.ListAPIView):
    serializer_class = SearchHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SearchHistory.objects.filter(user=self.request.user).order_by('-created_at')[:5]
