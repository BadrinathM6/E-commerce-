import os
import psycopg2
from django.db import connections
from django.db.utils import OperationalError
import logging

logger = logging.getLogger(__name__)

def test_supabase_connection():
    """Test the connection to Supabase database"""
    try:
        # Get database credentials from environment
        db_params = {
            'dbname': os.environ.get('DB_NAME'),
            'user': os.environ.get('DB_USER'),
            'password': os.environ.get('DB_PASSWORD'),
            'host': os.environ.get('DB_HOST'),
            'port': os.environ.get('DB_PORT', '5432'),
            'sslmode': 'require'
        }
        
        # Try to establish a connection
        conn = psycopg2.connect(**db_params)
        
        # Create a cursor and test a simple query
        with conn.cursor() as cur:
            cur.execute('SELECT version();')
            version = cur.fetchone()
            logger.info(f"Connected to PostgreSQL version: {version[0]}")
            
        conn.close()
        return True, "Connection successful"
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        return False, str(e)

def check_database_health():
    """Check database connection health"""
    try:
        db_conn = connections['default']
        db_conn.cursor()
        return True
    except OperationalError as e:
        logger.error(f"Database health check failed: {str(e)}")
        return False