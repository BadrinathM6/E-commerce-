import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get('/orders/');
      console.log('API Response:', response.data);
      
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        console.error('Unexpected data structure');
        setError('Unexpected data structure in the response.');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again.');
      setLoading(false);
    }
  };

  const handleOrderClick = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };

  const formatPrice = (price) => {
    const numPrice = Number(price);
    return isNaN(numPrice) ? 'N/A' : `₹${numPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  if (loading) return <div className="text-center mt-8">Loading orders...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
      {orders.length === 0 ? (
        <p className="text-center">You have no orders yet.</p>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {orders.map((order) => (
            <div 
              key={order.id} 
              onClick={() => handleOrderClick(order.id)}
              className="p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="text-sm text-gray-600">{formatDate(order.ordered_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(order.total_price)}</p>
                  <p className="text-sm text-gray-600">{order.status}</p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm font-semibold">Items:</p>
                {order.items && order.items.map((item, itemIndex) => (
                  <p key={itemIndex} className="text-sm">
                    {item.product} - Quantity: {item.quantity}, Price: {formatPrice(item.price)}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderList;