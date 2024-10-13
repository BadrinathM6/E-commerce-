from django.urls import re_path
from . import consumers  # Import your WebSocket consumer

websocket_urlpatterns = [
    re_path(r'ws/some_path/$', consumers.MyWebSocketConsumer.as_asgi()),  # Adjust 'some_path' accordingly
]
