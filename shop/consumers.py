from channels.generic.websocket import AsyncWebsocketConsumer
import json

class MyWebSocketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()  # Accept the WebSocket connection

    async def disconnect(self, close_code):
        pass  # Handle disconnection

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Process incoming data and send response
        await self.send(text_data=json.dumps({
            'message': 'Response from server'
        }))
