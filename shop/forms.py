from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import NameUser

class NameUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    phone_number = forms.CharField(max_length=15, required=False)
    
    class Meta:
        model = NameUser
        fields = ("username", "email", "phone_number", "password1", "password2")

class NameAuthenticationForm(AuthenticationForm):
    remember_me = forms.BooleanField(required=False)
    
    class Meta:
        model = NameUser
        fields = ("username", "password")