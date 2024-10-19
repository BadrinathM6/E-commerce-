import logging
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Category, Product, Cart, CartItem, SearchHistory, Review, Order, OrderItem
from .serializers import NameUserSerializer, ProductSerializer, CartItemSerializer, CategorySerializer
from django.contrib.auth import login, authenticate
from rest_framework_simplejwt.tokens import RefreshToken


logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    logger.info(f"Received registration data: {request.data}")
    
    serializer = NameUserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        logger.info("User registered successfully")
        return Response({"message": "Registration successful"}, status=status.HTTP_201_CREATED)
    else:
        logger.error(f"Registration failed. Errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    print(f"Attempting login for username: {username}")

    if not username or not password:
        return Response({"message": "Username and password required"}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        print(f"Authentication successful for user: {user.username}")
        if not user.is_active:
            print(f"User {user.username} is not active")
            return Response({"message": "User account is not active."}, status=status.HTTP_401_UNAUTHORIZED)
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': "Login successful!"
        }, status=status.HTTP_200_OK)
    else:
        print(f"Authentication failed for username: {username}")
        return Response({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def home(request):
    trending_products = Product.objects.filter(trending_now=True)[:4]
    deal_products = Product.objects.filter(deals_of_the_day=True)[:4]
    categories = Category.objects.all()

    data = {
        'categories': CategorySerializer(categories, many=True, context={'request': request}).data,
        'trending_products': ProductSerializer(trending_products, many=True).data,
        'deal_products': ProductSerializer(deal_products, many=True).data,
    }

    return Response(data)

@api_view(['GET'])
def product_list(request):
    products = Product.objects.all()
    category_id = request.GET.get('category')
    search_query = request.GET.get('q', '').strip()

    if category_id:
        products = products.filter(category_id=category_id)

    if search_query:
        products = products.filter(
            Q(name__icontains=search_query) | Q(description__icontains=search_query)
        )

        if request.user.is_authenticated:
            SearchHistory.objects.create(user=request.user, query=search_query)
        else:
            SearchHistory.objects.create(query=search_query)

    product_data = ProductSerializer(products, many=True).data

    return Response({'product_data': product_data})

@api_view(['GET'])
def product_detail(request, product_id):
    # Fetch the product or return 404
    product = get_object_or_404(Product, id=product_id)
    
    # Get related images and reviews
    all_images = product.images.all()
    thumbnails = all_images.filter(is_thumbnail=True)
    reviews = Review.objects.filter(product=product).order_by('-created_at')
    
    # Fetch similar products (excluding the current one)
    similar_products = Product.objects.filter(category=product.category).exclude(id=product.id)
    
    # Fill remaining similar products if less than 3 are found
    if similar_products.count() < 3:
        remaining_count = 3 - similar_products.count()
        other_products = Product.objects.exclude(Q(category=product.category) | Q(id=product.id))[:remaining_count]
        similar_products = list(similar_products) + list(other_products)
    else:
        similar_products = similar_products[:7]
    
    # Use serializer for the main product and similar products
    product_serializer = ProductSerializer(product)
    similar_products_serializer = ProductSerializer(similar_products, many=True)
    
    # Add thumbnails and reviews to the product data
    product_data = product_serializer.data
    product_data['thumbnails'] = [{'image': img.image.url} for img in thumbnails]
    product_data['reviews'] = [{'user': review.user.username, 'id': review.id, 'rating': review.rating, 'text': review.review} for review in reviews]
    product_data['similar_products'] = similar_products_serializer.data
    product_data['description_points'] = product.description.split("*")

    # Return the final product data as response
    return Response(product_data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request, product_id):
    logger.info(f"Add to cart view accessed for product_id: {product_id}")
    product = get_object_or_404(Product, id=product_id)
    cart, created = Cart.objects.get_or_create(user=request.user)
    cart_item, item_created = CartItem.objects.get_or_create(cart=cart, product=product)

    if not item_created:
        cart_item.quantity += 1
        cart_item.save()

    logger.info(f"Product {product.name} added to cart for user {request.user.username}")
    return Response({'message': f"{product.name} added to cart.", 'status': 'success'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_cart(request):
    logger.info(f"View cart accessed for user {request.user.username}")
    cart, created = Cart.objects.get_or_create(user=request.user)
    cart_items = CartItem.objects.filter(cart=cart)

    serialized_items = CartItemSerializer(cart_items, many=True).data
    
    total_original_price = sum(item.product.original_price * item.quantity for item in cart_items)
    total_discounted_price = sum(item.product.discounted_price * item.quantity for item in cart_items)
    total_discount = total_original_price - total_discounted_price

    return Response({
        'cart_items': serialized_items,
        'total_original_price': total_original_price,
        'total_discounted_price': total_discounted_price,
        'total_discount': total_discount,
        'status': 'success'
    })
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, product_id):
    logger.info(f"Remove from cart view accessed for product_id: {product_id}")
    cart = get_object_or_404(Cart, user=request.user)
    product = get_object_or_404(Product, id=product_id)

    cart_item = CartItem.objects.filter(cart=cart, product=product).first()
    if cart_item:
        cart_item.delete()
        logger.info(f"Product {product.name} removed from cart for user {request.user.username}")
        return Response({'message': f"{product.name} removed from cart.", 'status': 'success'})
    else:
        logger.warning(f"Product {product_id} not found in cart for user {request.user.username}")
        return Response({'message': 'Product not found in cart.', 'status': 'error'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_cart(request, product_id):
    logger.info(f"Update cart view accessed for product_id: {product_id}")
    try:
        data = request.data
        quantity = data.get('quantity')

        cart = get_object_or_404(Cart, user=request.user)
        product = get_object_or_404(Product, id=product_id)

        cart_item = CartItem.objects.filter(cart=cart, product=product).first()

        if cart_item:
            if quantity is not None and quantity > 0:
                # Update the quantity of the cart item
                cart_item.quantity = quantity
                cart_item.save()

                # Recalculate total prices for the cart after updating the quantity
                cart_items = CartItem.objects.filter(cart=cart)
                
                total_original_price = sum(item.product.original_price * item.quantity for item in cart_items)
                total_discounted_price = sum(item.product.discounted_price * item.quantity for item in cart_items)
                total_discount = total_original_price - total_discounted_price

                logger.info(f"Cart updated for user {request.user.username}: {product.name} quantity set to {quantity}")
                return Response({
                    'message': 'Cart updated successfully',
                    'status': 'success',
                    'discounted_price': cart_item.product.discounted_price * quantity,  # Updated price for the current item
                    'total_discounted_price': total_discounted_price,  # Updated total price for the cart
                    'total_discount': total_discount  # Updated total discount for the cart
                })
            else:
                # Remove item from cart if quantity is zero or less
                cart_item.delete()
                logger.info(f"Product {product.name} removed from cart for user {request.user.username} due to quantity 0")
                return Response({'message': 'Product removed from cart', 'status': 'success'})
        else:
            logger.warning(f"Product {product_id} not found in cart for user {request.user.username}")
            return Response({'message': 'Product not found in cart.', 'status': 'error'}, status=404)

    except Exception as e:
        logger.error(f"Error updating cart: {str(e)}")
        return Response({'message': 'An error occurred while updating the cart.', 'status': 'error'}, status=500)

                
# checkout_view
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
