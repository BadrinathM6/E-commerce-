import json
import logging
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.generic import CreateView
from django.db.models import Q
from django.http import JsonResponse
from .models import Category, Product, ProductImage, Cart, CartItem, Order, OrderItem, SearchHistory, Review, NameUser
from django.contrib.auth import login, authenticate
from django.contrib.auth.views import LoginView
from .forms import NameUserCreationForm, NameAuthenticationForm
from django.views.decorators.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.views.decorators.http import require_GET, require_POST

logger = logging.getLogger(__name__)

@require_GET
def get_csrf_token(request):
    csrf_token = get_token(request)
    return JsonResponse({'csrfToken': csrf_token})

# Registration_view
@method_decorator(csrf_protect, name='dispatch')
class CustomRegistrationView(CreateView):
    def post(self, request, *args, **kwargs):
        logger.info(f"Received data: {request.body}")
        try:
            data = json.loads(request.body)
            form = NameUserCreationForm(data)
            
            if form.is_valid():
                user = form.save()
                return JsonResponse({'message': 'You have successfully registered.', 'status': 'success'}, status=201)
            
            errors = {field: error_list for field, error_list in form.errors.items()}
            return JsonResponse({'message': 'Registration failed.', 'errors': errors, 'status': 'error'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON data', 'status': 'error'}, status=400)
# Login_view
class CustomLoginView(LoginView):
    form_class = NameAuthenticationForm

    def form_valid(self, form):
        login(self.request, form.get_user())
        return JsonResponse({'message': 'You have successfully logged in.', 'status': 'success'}, status=200)

    def form_invalid(self, form):
        return JsonResponse({'message': 'Invalid login credentials.', 'status': 'error'}, status=400)


# Home_view
def home(request):
    trending_products = Product.objects.filter(trending_now=True)[:4]
    deal_products = Product.objects.filter(deals_of_the_day=True)[:4]
    categories = Category.objects.all()

    data = {
        'categories': [
             {
                'id': category.id,
                'name': category.name,
                'image_url': category.image.url if category.image else None  # Send image URL
             } for category in categories
        ],

        'trending_products': [
            {
                'id': product.id,
                'short_desc': product.short_desc,
                'short_disc': product.short_disc,
                'main_image_url': product.main_image.url if product.main_image else None
            } for product in trending_products
        ],
        'deal_products': [
            {
                'id': product.id,
                'short_desc': product.short_desc,
                'short_disc': product.short_disc,
                'main_image_url': product.main_image.url if product.main_image else None
            } for product in deal_products
        ],
    }

    return JsonResponse(data)


# product_list_view
def product_list(request):
    products = Product.objects.all()
    category_id = request.GET.get('category')
    search_query = request.GET.get('q', '').strip()

    print("Category ID:", category_id)  # Debugging
    print("Search Query:", search_query)  # Debugging

    if category_id:
        products = products.filter(category_id=category_id)
        print(f"Filtered by category: {category_id}, number of products: {products.count()}")

    if search_query:
        products = products.filter(
            Q(name__icontains=search_query) | Q(description__icontains=search_query)
        )
        print(f"Number of products after search filter: {products.count()}")  # Debugging

        # Save search history
        if request.user.is_authenticated:
            SearchHistory.objects.create(user=request.user, query=search_query)
        else:
            SearchHistory.objects.create(query=search_query)

    product_data = [
        {
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'image': product.main_image.url,
            'average_rating': product.average_rating,
            'discounted_price': product.discounted_price,
            'original_price': product.original_price,
            'discount_percentage': product.discount_percentage,
            'number_of_reviews': product.number_of_reviews,
        }
        for product in products
    ]

    return JsonResponse({'product_data': product_data})



# product_detail_view
def product_detail(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    all_images = product.images.all()
    thumbnails = all_images.filter(is_thumbnail=True)
    reviews = Review.objects.filter(product=product).order_by('-created_at')
    similar_products = Product.objects.filter(category=product.category).exclude(id=product.id)

    if similar_products.count() < 3:
        remaining_count = 3 - similar_products.count()
        other_products = Product.objects.exclude(Q(category=product.category) | Q(id=product.id))[:remaining_count]
        similar_products = list(similar_products) + list(other_products)
    else:
        similar_products = similar_products[:7]

    description_points = product.description.split("*")

    product_data = {
        'name': product.name,
        'main_image':product.main_image.url if product.main_image else None,
        'description': product.description,
        'discount_percentage': product.discount_percentage,
        'original_price': product.original_price,
        'discounted_price': product.discounted_price,
        'reviews': [{'user': review.user.username,'id': review.id, 'rating': review.rating, 'text': review.review, 'rating': review.rating} for review in reviews],
        'thumbnails': [{'image': img.image.url} for img in thumbnails],
        'similar_products': [{'image': p.main_image.url, 'id': p.id, 'name': p.name, 'original_price': p.original_price, 'discount_percentage': p.discount_percentage, 'discounted_price': p.discounted_price} for p in similar_products],
        'description_points': description_points,
        'average_rating': product.average_rating,  # Assuming product has a rating field
    }

    return JsonResponse(product_data)
    

# Add_to_cart_view
# @login_required
@require_POST
@csrf_exempt
def add_to_cart(request, product_id):
    if request.method == 'POST':
        product = get_object_or_404(Product, id=product_id)
        if request.user.is_authenticated:
        # Get or create the cart for the authenticated user
          cart, created = Cart.objects.get_or_create(user=request.user)
        else:
        # Create a guest cart using session
          cart, created = Cart.objects.get_or_create(user=None)

        cart_item, item_created = CartItem.objects.get_or_create(cart=cart, product=product)

        if not item_created:
            cart_item.quantity += 1
            cart_item.save()

        return JsonResponse({'message': f"{product.name} added to cart.", 'success': True})

    return JsonResponse({'message': 'Invalid request method.', 'success': False})


# view_cart_view
# @login_required
def view_cart(request):
    # Check if the user is authenticated
    if request.user.is_authenticated:
        # Get or create the cart for the authenticated user
        cart, created = Cart.objects.get_or_create(user=request.user)
    else:
        # Create a guest cart using session
        cart, created = Cart.objects.get_or_create(user=None)
    
    # Fetch cart items
    cart_items = CartItem.objects.filter(cart=cart)

    # Initialize total values
    total_original_price = 0
    total_discounted_price = 0
    total_discount = 0

    # Prepare the cart data
    cart_data = []
    for item in cart_items:
        product = item.product
        original_price = product.original_price
        discount_percentage = product.discount_percentage
        discounted_price = original_price * (1 - discount_percentage / 100)
        
        # Update totals
        total_original_price += original_price * item.quantity
        total_discounted_price += discounted_price * item.quantity
        total_discount += (original_price - discounted_price) * item.quantity
        
        # Add product details to cart data
        cart_data.append({
            'product': {
                'id': product.id,
                'name': product.name,
                'main_image': {'url': product.main_image.url},  # Assuming your product has an image field
                'original_price': original_price,
                'discounted_price': discounted_price,
                'discount_percentage': discount_percentage,
                'average_rating': product.average_rating,
                'number_of_reviews': product.number_of_reviews,
            },
            'quantity': item.quantity
        })
    
    # Return the full cart data along with totals
    return JsonResponse({
        'cart_items': cart_data,
        'total_original_price': total_original_price,
        'total_discounted_price': total_discounted_price,
        'total_discount': total_discount
    })


# remove_cart_views
# @login_required
@require_POST
@csrf_exempt
def remove_from_cart(request, product_id):
    cart = get_object_or_404(Cart, user=None)
    product = get_object_or_404(Product, id=product_id)

    cart_item = CartItem.objects.filter(cart=cart, product=product).first()
    if cart_item:
        cart_item.delete()

    return JsonResponse({'message': f"{product.name} removed from cart.", 'success': True})

@require_POST
@csrf_exempt
def update_cart(request, product_id):
    if request.method == 'POST':
        try:
            # Parse the JSON body
            data = json.loads(request.body)
            quantity = data.get('quantity')

            # Validate the quantity: it must be a positive integer
            if quantity is None or not isinstance(quantity, int) or quantity <= 0:
                return JsonResponse({'error': 'Invalid quantity, must be a positive integer'}, status=400)

            # Get the cart from session (default to an empty dict if not present)
            cart = request.session.get('cart', {})

            # Debug: Print the cart contents and product_id for inspection
            print("Cart contents:", cart)
            print("Requested product ID:", product_id)

            # Ensure product_id is treated as a string for dictionary key matching
            product_id_str = str(product_id)

            # Check if the product_id exists in the cart
            if product_id_str in cart:
                # Fetch the product to ensure it exists
                try:
                    product = Product.objects.get(id=product_id)
                except Product.DoesNotExist:
                    return JsonResponse({'error': 'Product not found'}, status=404)

                # Update the quantity in the cart
                cart[product_id_str]['quantity'] = quantity

                # Calculate prices for this product
                discounted_price = product.discounted_price * quantity
                original_price = product.original_price * quantity

                # Recalculate the total prices and discounts for the entire cart
                total_discounted_price = sum(
                    item['quantity'] * Product.objects.get(id=pid).discounted_price
                    for pid, item in cart.items() if 'quantity' in item
                )
                total_discount = sum(
                    (Product.objects.get(id=pid).original_price - Product.objects.get(id=pid).discounted_price) * item['quantity']
                    for pid, item in cart.items() if 'quantity' in item
                )

                # Save updated cart to session
                request.session['cart'] = cart
                request.session.modified = True

                # Return the updated information as a JSON response
                return JsonResponse({
                    'discounted_price': discounted_price,
                    'original_price': original_price,
                    'total_discounted_price': total_discounted_price,
                    'total_discount': total_discount,
                })
            else:
                print("Product not found in cart")
                return JsonResponse({'error': 'Product not in cart'}, status=404)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            print("Error occurred:", str(e))  # Print the error for debugging
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)


                

# checkout_view
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

        return JsonResponse({'message': "Order placed successfully!", 'order_id': order.id, 'success': True})

    cart_data = [{'product': item.product.name, 'quantity': item.quantity, 'price': item.product.price} for item in cart_items]

    return JsonResponse({'cart_items': cart_data, 'total': total})


# order_confirmation_view
@login_required
def order_confirmation(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)

    order_data = {
        'id': order.id,
        'total_price': order.total_price,
        'items': [{'product': item.product.name, 'quantity': item.quantity, 'price': item.price} for item in order.items.all()]
    }

    return JsonResponse(order_data)


# search_view
def search(request):
    query = request.GET.get('q')
    if query:
        products = Product.objects.filter(Q(name__icontains=query) | Q(description__icontains=query))
        product_data = [{'name': product.name, 'price': product.discounted_price} for product in products]
        return JsonResponse({'results': product_data, 'query': query})

    return JsonResponse({'results': [], 'message': 'No search query provided.'})


#search_suggestion_view
def search_suggestions(request):
    query = request.GET.get('q', '').strip()
    suggestions = []

    if query:
        suggestions = Product.objects.filter(short_name__icontains=query).values_list('short_name', flat=True)[:10]

    return JsonResponse(list(suggestions), safe=False)


# search_history_view
# @login_required
def search_history(request):
    if request.user.is_authenticated:
        history = SearchHistory.objects.filter(user=request.user).order_by('-created_at')[:5]
        history_list = [{'query': entry.query, 'timestamp': entry.created_at} for entry in history]
        return JsonResponse({
            'authenticated': True,
            'history': history_list
        })
    else:
        return JsonResponse({
            'authenticated': False,
            'message': 'User is not authenticated'
        }, status=200)


# submit_review_view
def submit_review(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    if request.method == "POST":
        review_text = request.POST.get('review')
        rating = int(request.POST.get('rating'))

        existing_review = Review.objects.filter(product=product, user=request.user).first()

        if existing_review:
            return JsonResponse({'message': "You have already submitted a review for this product.", 'success': False})

        new_review = Review.objects.create(
            product=product,
            user=request.user,
            review_text=review_text,
            rating=rating
        )
        new_review.save()
        return JsonResponse({'message': "Thank you for the review!", 'success': True})

    return JsonResponse({'message': "Invalid request method.", 'success': False})
