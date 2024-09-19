from django.urls import path
from .views import (
    home, product_detail, add_to_cart, view_cart, checkout, order_confirmation,
    search, search_suggestions, search_history,
    ProductListView, ProductDetailView, CategoryListView, SearchHistoryView
)

urlpatterns = [
    # Existing Django views
    path('', home, name='home'),
    path('product/<int:product_id>/', product_detail, name='product_detail'),
    path('add-to-cart/<int:product_id>/', add_to_cart, name='add_to_cart'),
    path('cart/', view_cart, name='view_cart'),
    path('checkout/', checkout, name='checkout'),
    path('order-confirmation/<int:order_id>/', order_confirmation, name='order_confirmation'),
    path('search/', search, name='search'),
    path('search-suggestions/', search_suggestions, name='search_suggestions'),
    path('search-history/', search_history, name='search_history'),

    # API Views
    path('api/products/', ProductListView.as_view(), name='product_list_api'),
    path('api/products/<int:pk>/', ProductDetailView.as_view(), name='product_detail_api'),
    path('api/categories/', CategoryListView.as_view(), name='category_list_api'),
    path('api/search-history/', SearchHistoryView.as_view(), name='search_history_api'),
]
