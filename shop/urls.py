from django.conf import settings
from django.contrib.auth import views as auth_views
from django.conf.urls.static import static
from django.urls import path
from .views import (
    home, product_list, product_detail, add_to_cart, remove_from_cart, view_cart, checkout, order_confirmation, submit_review, CustomRegistrationView, CustomLoginView, 
    search, search_suggestions, search_history, submit_review

)

urlpatterns = [
    # Existing Django views
    path('', home, name='home'),
    path('product/<int:product_id>/', product_detail, name='product_detail'),
    path('product/<int:product_id>/submit-review/', submit_review, name='submit_review'),
    path('product-list/', product_list, name='product_list'),
    path('add-to-cart/<int:product_id>/', add_to_cart, name='add_to_cart'),
    path('remove-from-cart/<int:product_id>/', remove_from_cart, name='remove_from_cart'),
    path('cart/', view_cart, name='view_cart'),
    path('checkout/', checkout, name='checkout'),
    path('order-confirmation/<int:order_id>/', order_confirmation, name='order_confirmation'),
    path('search/', search, name='search'),
    path('search-suggestions/', search_suggestions, name='search_suggestions'),
    path('search-history/', search_history, name='search_history'),
    path('password_reset/', auth_views.PasswordResetView.as_view(template_name='shop/password_reset.html'), name='password_reset'),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(template_name='shop/password_reset_done.html'), name='shop/password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name='shop/password_reset_confirm.html'), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(template_name='shop/password_reset_complete.html'), name='password_reset_complete'),
    path('register/', CustomRegistrationView.as_view(), name='register'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
