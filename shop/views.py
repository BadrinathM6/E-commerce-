import logging
import os
from django.conf import settings
import base64
from django.db.models import Avg
from django.shortcuts import get_object_or_404
from shop.utils.db_utils import check_database_health
from django.db.models import Q
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import NameUser,Category, PaymentOrder, Product, Cart, CartItem, SearchHistory, Review, Order, OrderItem, SavedAddress, Wishlist
from .serializers import NameUserSerializer, OrderSerializer, ProductSerializer, CartItemSerializer, CategorySerializer, ReviewSerializer, SavedAddressSerializer, UpdateProfileSerializer, WishlistSerializer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.encoding import force_str
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.db.models.query_utils import Q
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    serializer = NameUserSerializer(request.user)
    return Response(serializer.data)

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
@permission_classes([AllowAny])
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
@permission_classes([AllowAny])
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
@permission_classes([AllowAny])
def product_detail(request, product_id):
    try:
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
        
        # Safely handle image URLs
        try:
            product_data['thumbnails'] = []
            for img in thumbnails:
                try:
                    # Check if the image field exists and has a URL
                    if hasattr(img, 'image') and img.image:
                        if hasattr(img.image, 'url'):
                            product_data['thumbnails'].append({'image': img.image.url})
                        else:
                            # If using Cloudinary, you might need to construct the URL differently
                            # This assumes you have CLOUDINARY_URL in your environment variables
                            from cloudinary.utils import cloudinary_url
                            url, options = cloudinary_url(img.image.public_id)
                            product_data['thumbnails'].append({'image': url})
                except Exception as img_error:
                    logger.error(f"Error processing image {img.id}: {str(img_error)}")
                    continue
        except Exception as thumbnail_error:
            logger.error(f"Error processing thumbnails: {str(thumbnail_error)}")
            product_data['thumbnails'] = []
        
        # Add reviews data
        product_data['reviews'] = []
        for review in reviews:
            try:
                product_data['reviews'].append({
                    'user': review.user.username,
                    'id': review.id,
                    'rating': review.rating,
                    'text': review.review
                })
            except Exception as review_error:
                logger.error(f"Error processing review {review.id}: {str(review_error)}")
                continue
        
        # Add similar products
        product_data['similar_products'] = similar_products_serializer.data
        
        # Add description points
        try:
            if product.description:
                product_data['description_points'] = product.description.split("*")
            else:
                product_data['description_points'] = []
        except Exception as desc_error:
            logger.error(f"Error processing description: {str(desc_error)}")
            product_data['description_points'] = []

        # Return the final product data as response
        return Response(product_data)
        
    except Exception as e:
        logger.error(f"Error in product_detail view: {str(e)}")
        return Response(
            {'error': 'An error occurred while fetching product details'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

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
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def saved_addresses(request):
    addresses = SavedAddress.objects.filter(user=request.user)
    serializer = SavedAddressSerializer(addresses, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout(request):
    print("Received request data:", request.data)  # Debug: log the incoming request data
    
    cart, created = Cart.objects.get_or_create(user=request.user)
    cart_items = cart.items.all()
    
    if not cart_items.exists():
        return Response({'message': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

    use_saved_address = request.data.get('use_saved_address', False)
    shipping_address_data = request.data.get('shipping_address')

    if use_saved_address:
        # Check if the address ID provided exists
        try:
            address = SavedAddress.objects.get(id=shipping_address_data, user=request.user)
        except SavedAddress.DoesNotExist:
            return Response({'message': 'Invalid saved address.'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        # Validate the shipping address data
        if not shipping_address_data:
            return Response({'message': 'Shipping address data is required.'}, status=status.HTTP_400_BAD_REQUEST)

        address_serializer = SavedAddressSerializer(data=shipping_address_data)
        if address_serializer.is_valid():
            address = address_serializer.save(user=request.user)
        else:
            return Response(address_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    total = sum(item.product.discounted_price * item.quantity for item in cart_items)

    order = Order.objects.create(
        user=request.user,
        total_price=total,
        shipping_address=f"{address.full_name}, {address.address_line1}, {address.city}, {address.state}, {address.zip_code}, {address.country}"
    )

    for item in cart_items:
        OrderItem.objects.create(
            order=order, 
            product=item.product, 
            quantity=item.quantity, 
            price=item.product.discounted_price
        )
    
    # Clear the cart after creating the order
    cart_items.delete()

    serializer = OrderSerializer(order)
    return Response({
        'message': "Order placed successfully!",
        'order': serializer.data
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_now_checkout(request):
    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity')
    shipping_address_data = request.data.get('shipping_address')

    if not product_id or not quantity or not shipping_address_data:
        return Response({'message': 'Invalid data provided.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'message': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

    address_serializer = SavedAddressSerializer(data=shipping_address_data)
    if address_serializer.is_valid():
        address = address_serializer.save(user=request.user)
    else:
        return Response(address_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    total = product.discounted_price * int(quantity)

    order = Order.objects.create(
        user=request.user,
        total_price=total,
        shipping_address=f"{address.full_name}, {address.address_line1}, {address.city}, {address.state}, {address.zip_code}, {address.country}"
    )

    OrderItem.objects.create(
        order=order, 
        product=product, 
        quantity=quantity, 
        price=product.discounted_price
    )

    serializer = OrderSerializer(order)
    return Response({
        'message': "Order placed successfully!",
        'order': serializer.data
    }, status=status.HTTP_201_CREATED)

# order_detail_view
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    serializer = OrderSerializer(order)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_List(request):
    orders = Order.objects.filter(user=request.user).order_by('-ordered_at')

    if not orders.exists():
        return Response({'orders': [], 'message': 'No orders found.'}, status=200)

    serializer = OrderSerializer(orders, many=True)

    return Response(serializer.data)


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
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_review(request, product_id):
    try:
        product = get_object_or_404(Product, id=product_id)
        
        # Check if user has already reviewed this product
        if Review.objects.filter(product=product, user=request.user).exists():
            return Response({
                'status': 'error',
                'message': 'You have already reviewed this product'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate the rating
        rating = request.data.get('rating')
        if not rating or not isinstance(rating, (int, float)) or not (1 <= float(rating) <= 5):
            return Response({
                'status': 'error',
                'message': 'Please provide a valid rating between 1 and 5'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create the review
        review = Review.objects.create(
            product=product,  # Pass the product object directly
            user=request.user,  # Pass the user object directly
            review=request.data.get('review', ''),
            rating=rating
        )
        
        serializer = ReviewSerializer(review)
        return Response({
            'status': 'success',
            'message': 'Review submitted successfully',
            'review': serializer.data
        }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_product_reviews(request, product_id):
    """
    Get all reviews for a specific product
    """
    try:
        product = get_object_or_404(Product, id=product_id)
        reviews = Review.objects.filter(product=product).order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        
        # Calculate average rating
        avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
        
        return Response({
            'status': 'success',
            'reviews': serializer.data,
            'total_reviews': reviews.count(),
            'average_rating': round(avg_rating, 1)
        })
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    try:
        email = request.data.get('email')
        if not email:
            logger.warning('Password reset request received without email')
            return Response({'message': 'Email is required'}, status=400)
            
        associated_users = NameUser.objects.filter(Q(email=email))
        if associated_users.exists():
            for user in associated_users:
                # Generate password reset token
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                
                # Get domain settings from settings.py
                frontend_domain = settings.FRONTEND_DOMAIN
                frontend_protocol = settings.FRONTEND_PROTOCOL
                
                # Build the reset URL
                reset_url = f"{frontend_protocol}://{frontend_domain}/reset/{uid}/{token}"
                
                # Prepare email context
                context = {
                    "email": user.email,
                    'domain': frontend_domain,
                    'site_name': 'RolexCart',
                    "uid": uid,
                    "user": user,
                    'token': token,
                    'protocol': frontend_protocol,
                    'reset_url': reset_url  # Add the complete reset URL to the context
                }
                
                # Render email content
                email_template = "shop/password_reset_email.txt"
                email_content = render_to_string(email_template, context)
                
                try:
                    # Send email
                    send_mail(
                        subject="Password Reset Request",
                        message=email_content,
                        from_email=settings.EMAIL_HOST_USER,
                        recipient_list=[user.email],
                        fail_silently=False,
                    )
                    
                    logger.info(f"Password reset email sent successfully to {user.email}")
                    logger.info(f"Reset URL generated: {reset_url}")  # Log the reset URL for debugging
                    
                    return Response({
                        'message': 'Password reset email has been sent.',
                        'status': 'success'
                    })
                
                except Exception as email_error:
                    logger.error(f"Failed to send password reset email: {str(email_error)}")
                    return Response({
                        'message': 'Failed to send password reset email.',
                        'status': 'error'
                    }, status=500)
                    
        # Security best practice: Don't reveal if email exists
        return Response({
            'message': 'If a user exists with this email address, a password reset link will be sent.',
            'status': 'success'
        })
                
    except Exception as e:
        logger.error(f"Password reset error: {str(e)}")
        return Response({
            'message': 'An error occurred during password reset.',
            'status': 'error'
        }, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request, uidb64, token):
    """
    Handle password reset confirmation.
    
    Args:
        request: HTTP request object
        uidb64: Base64 encoded user ID
        token: Password reset token
    
    Returns:
        Response object with status and message
    """
    try:
        # Validate input parameters
        if not uidb64 or not token:
            return Response({
                'status': 'error',
                'message': 'Invalid password reset link'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Extract and validate passwords from request data
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('new_password2')

        if not new_password or not confirm_password:
            return Response({
                'status': 'error',
                'message': 'Both password fields are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({
                'status': 'error',
                'message': 'Passwords do not match'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Safely decode the base64 user ID
        try:
            # Add padding if necessary
            padded_uidb64 = uidb64 + '=' * (-len(uidb64) % 4)
            uid = force_str(urlsafe_base64_decode(padded_uidb64))
        except (TypeError, ValueError, base64.binascii.Error) as e:
            logger.error(f'Base64 decoding error: {str(e)}')
            return Response({
                'status': 'error',
                'message': 'Invalid password reset link'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Get the user model and validate user exists
        User = get_user_model()
        try:
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, User.DoesNotExist):
            logger.error(f'User not found for ID: {uid}')
            return Response({
                'status': 'error',
                'message': 'Invalid password reset link'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verify the token is valid
        if not default_token_generator.check_token(user, token):
            logger.warning(f'Invalid or expired token for user {user.pk}')
            return Response({
                'status': 'error',
                'message': 'Invalid or expired password reset link'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate password
        try:
            # Use Django's built-in password validation
            user.set_password(new_password)
            user.save()
            logger.info(f'Password successfully reset for user {user.pk}')
            
            return Response({
                'status': 'success',
                'message': 'Password has been reset successfully'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f'Password validation error: {str(e)}')
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(f'Unexpected error in password reset: {str(e)}')
        return Response({
            'status': 'error',
            'message': 'An error occurred while resetting your password'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    serializer = UpdateProfileSerializer(user, data=request.data, partial=True)
    
    if serializer.is_valid():
        # Validate email uniqueness if it's being changed
        new_email = serializer.validated_data.get('email')
        if new_email and new_email != user.email:
            if NameUser.objects.filter(email=new_email).exists():
                return Response(
                    {'email': 'This email is already in use.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        # Validate phone number uniqueness if it's being changed
        new_phone = serializer.validated_data.get('phone_number')
        if new_phone and new_phone != user.phone_number:
            if NameUser.objects.filter(phone_number=new_phone).exists():
                return Response(
                    {'phone_number': 'This phone number is already in use.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_address(request):
    serializer = SavedAddressSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_address(request, address_id):
    try:
        address = SavedAddress.objects.get(id=address_id, user=request.user)
        address.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except SavedAddress.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wishlist(request):
    wishlist_items = Wishlist.objects.filter(user=request.user).select_related('product')
    serializer = WishlistSerializer(wishlist_items, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_wishlist(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
        wishlist_item = Wishlist.objects.filter(user=request.user, product=product)
        
        if wishlist_item.exists():
            wishlist_item.delete()
            return Response({'status': 'removed', 'message': 'Removed from wishlist'})
        else:
            Wishlist.objects.create(user=request.user, product=product)
            return Response({'status': 'added', 'message': 'Added to wishlist'})
            
    except Product.DoesNotExist:
        return Response({'message': 'Product not found'}, status=404)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request, product_id):
    try:
        wishlist_item = Wishlist.objects.get(user=request.user, product_id=product_id)
        wishlist_item.delete()
        return Response({'message': 'Item removed from wishlist'})
    except Wishlist.DoesNotExist:
        return Response({'message': 'Item not found in wishlist'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_wishlist_status(request, product_id):
    is_wishlisted = Wishlist.objects.filter(user=request.user, product_id=product_id).exists()
    return Response({'is_wishlisted': is_wishlisted})

def health_check(request):
    """Health check endpoint for the application"""
    database_status = check_database_health()
    
    response_data = {
        'status': 'healthy' if database_status else 'unhealthy',
        'database': {
            'connected': database_status,
            'host': os.environ.get('DB_HOST'),
            'name': os.environ.get('DB_NAME')
        }
    }
    
    status_code = 200 if database_status else 503
    return JsonResponse(response_data, status=status_code)

# client = razorpay.Client(auth=(os.getenv('RAZORPAY_KEY_ID'), os.getenv('RAZORPAY_KEY_SECRET')))

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def create_payment(request):
#     try:
#         order_id = request.data.get('order_id')
#         order = Order.objects.get(id=order_id, user=request.user)
        
#         # Convert amount to paise (Razorpay expects amount in smallest currency unit)
#         amount_in_paise = int(float(order.total_price) * 100)
        
#         # Create Razorpay Order
#         razorpay_order = client.order.create({
#             'amount': amount_in_paise,
#             'currency': 'INR',
#             'payment_capture': 1,
#             'notes': {
#                 'order_id': str(order.id),
#                 'user_id': str(request.user.id)
#             }
#         })
        
#         # Create PaymentOrder in database
#         payment_order = PaymentOrder.objects.create(
#             user=request.user,
#             order=order,
#             razorpay_order_id=razorpay_order['id'],
#             amount=order.total_price,
#             currency='INR'
#         )
        
#         return Response({
#             'order_id': razorpay_order['id'],
#             'amount': amount_in_paise,
#             'currency': 'INR',
#             'key': os.environ.get('RAZORPAY_KEY_ID')
#         })
        
#     except Exception as e:
#         return Response({
#             'error': str(e)
#         }, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def verify_payment(request):
#     try:
#         razorpay_order_id = request.data.get('razorpay_order_id')
#         razorpay_payment_id = request.data.get('razorpay_payment_id')
#         razorpay_signature = request.data.get('razorpay_signature')
        
#         # Verify signature
#         params_dict = {
#             'razorpay_order_id': razorpay_order_id,
#             'razorpay_payment_id': razorpay_payment_id,
#             'razorpay_signature': razorpay_signature
#         }
        
#         client.utility.verify_payment_signature(params_dict)
        
#         # Update payment status
#         payment_order = PaymentOrder.objects.get(razorpay_order_id=razorpay_order_id)
#         payment_order.razorpay_payment_id = razorpay_payment_id
#         payment_order.razorpay_signature = razorpay_signature
#         payment_order.status = 'completed'
#         payment_order.save()
        
#         # Update order status
#         order = payment_order.order
#         order.status = 'paid'
#         order.save()
        
#         return Response({'status': 'Payment verified successfully'})
        
#     except Exception as e:
#         return Response({
#             'error': str(e)
#         }, status=status.HTTP_400_BAD_REQUEST)