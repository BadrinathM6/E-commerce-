from django.core.management.base import BaseCommand
import psycopg2
import os
from django.conf import settings
from shop.models import Category, Product, ProductImage
from django.db import transaction
from decimal import Decimal

class Command(BaseCommand):
    help = 'Sync products from Supabase PostgreSQL to Django'

    def handle(self, *args, **kwargs):
        # Supabase connection settings
        supabase_conn = psycopg2.connect(
            dbname=os.environ.get('DB_NAME'),
            user=os.environ.get('DB_USER'),
            password= os.environ.get('DB_PASSWORD'),
            host=os.environ.get('DB_HOST'),
            port=os.environ.get('DB_PORT', '6543')  # Default PostgreSQL port
        )

        try:
            with supabase_conn.cursor() as cursor:
                # Fetch categories
                cursor.execute("""
                    SELECT id, name, image, slug 
                    FROM shop_category
                """)
                categories = cursor.fetchall()

                # Fetch products
                cursor.execute("""
                    SELECT id, name, description, discount_percentage, 
                           original_price, main_image, category_id, 
                           trending_now, deals_of_the_day, short_desc, 
                           short_disc, short_name, stock
                    FROM shop_product
                """)
                products = cursor.fetchall()

                # Fetch product images
                cursor.execute("""
                    SELECT id, product_id, image, is_thumbnail 
                    FROM shop_productimage
                """)
                product_images = cursor.fetchall()

            # Sync data using transaction
            with transaction.atomic():
                # Sync categories
                self.sync_categories(categories)
                
                # Sync products
                self.sync_products(products)
                
                # Sync product images
                self.sync_product_images(product_images)

            self.stdout.write(self.style.SUCCESS('Successfully synced data from Supabase'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error syncing data: {str(e)}'))
        finally:
            supabase_conn.close()

    def sync_categories(self, categories):
        for cat_id, name, image, slug in categories:
            Category.objects.update_or_create(
                id=cat_id,
                defaults={
                    'name': name,
                    'image': image,
                    'slug': slug
                }
            )
            self.stdout.write(f'Synced category: {name}')

    def sync_products(self, products):
        for (prod_id, name, description, discount_percentage, 
             original_price, main_image, category_id, trending_now, 
             deals_of_the_day, short_desc, short_disc, 
             short_name, stock) in products:
            
            try:
                category = Category.objects.get(id=category_id)
                
                Product.objects.update_or_create(
                    id=prod_id,
                    defaults={
                        'name': name,
                        'description': description,
                        'discount_percentage': Decimal(str(discount_percentage)) if discount_percentage else None,
                        'original_price': Decimal(str(original_price)) if original_price else None,
                        'main_image': main_image,
                        'category': category,
                        'trending_now': trending_now,
                        'deals_of_the_day': deals_of_the_day,
                        'short_desc': short_desc,
                        'short_disc': short_disc,
                        'short_name': short_name,
                        'stock': stock
                    }
                )
                self.stdout.write(f'Synced product: {name}')
            except Category.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'Category {category_id} not found for product {name}'))

    def sync_product_images(self, product_images):
        for img_id, product_id, image, is_thumbnail in product_images:
            try:
                product = Product.objects.get(id=product_id)
                
                ProductImage.objects.update_or_create(
                    id=img_id,
                    defaults={
                        'product': product,
                        'image': image,
                        'is_thumbnail': is_thumbnail
                    }
                )
                self.stdout.write(f'Synced image for product: {product.name}')
            except Product.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'Product {product_id} not found for image {img_id}'))