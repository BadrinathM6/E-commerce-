# Generated by Django 5.1.1 on 2024-10-20 07:29

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0017_alter_cart_user_alter_product_category_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='SavedAddress',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('full_name', models.CharField(max_length=255)),
                ('address_line1', models.CharField(max_length=255)),
                ('address_line2', models.CharField(blank=True, max_length=255, null=True)),
                ('city', models.CharField(max_length=100)),
                ('state', models.CharField(max_length=100)),
                ('zip_code', models.CharField(max_length=20)),
                ('country', models.CharField(max_length=100)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saved_addresses', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
