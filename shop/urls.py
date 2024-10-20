from django.conf import settings
from django.contrib.auth import views as auth_views
from django.conf.urls.static import static
from django.urls import path
from .views import (
    home, product_list, product_detail, add_to_cart, remove_from_cart, update_cart, view_cart, checkout, order_List, order_detail, submit_review, register_view, login_view,  
    search, search_suggestions, search_history, submit_review ,saved_addresses, user_profile, buy_now_checkout
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,  
)

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Existing Django views
    path('', home, name='home'),
    path('product/<int:product_id>/', product_detail, name='product_detail'),
    path('product/<int:product_id>/submit-review/', submit_review, name='submit_review'),
    path('product-list/', product_list, name='product_list'),
    path('add-to-cart/<int:product_id>/', add_to_cart, name='add_to_cart'),
    path('remove-from-cart/<int:product_id>/', remove_from_cart, name='remove_from_cart'),
    path('update-cart/<int:product_id>/', update_cart, name='update_cart'),
    path('cart/', view_cart, name='view_cart'),
    path('checkout/', checkout, name='checkout'),
    path('buy-now-checkout/', buy_now_checkout, name='buy-now-checkout'),
    path('saved-addresses/', saved_addresses, name='saved_addresses'),
    path('orders/', order_List, name='order_list'),
    path('orders/<int:order_id>/', order_detail, name='order_detail'),
    path('search/', search, name='search'),
    path('search-suggestions/', search_suggestions, name='search_suggestions'),
    path('search-history/', search_history, name='search_history'),
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('user-profile/', user_profile, name='user_profile'),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
