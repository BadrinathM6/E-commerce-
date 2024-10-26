from django.core.management.base import BaseCommand
from shop.utils.db_utils import test_supabase_connection
import os

class Command(BaseCommand):
    help = 'Verify Supabase database configuration and connection'

    def handle(self, *args, **options):
        # Print configuration
        self.stdout.write("\nSupabase Configuration:")
        self.stdout.write(f"Database Host: {os.environ.get('DB_HOST')}")
        self.stdout.write(f"Database Name: {os.environ.get('DB_NAME')}")
        self.stdout.write(f"Database Port: {os.environ.get('DB_PORT')}")
        
        # Test connection
        success, message = test_supabase_connection()
        if success:
            self.stdout.write(self.style.SUCCESS(f"\nConnection test successful: {message}"))
        else:
            self.stdout.write(self.style.ERROR(f"\nConnection test failed: {message}"))