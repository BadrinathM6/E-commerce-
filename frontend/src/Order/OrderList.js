import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, ArrowRight, Loader2 } from 'lucide-react';
import axiosInstance from '../utils/axiosConfig';
import { Helmet } from 'react-helmet';

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
      if (response.data.orders) {
        setOrders(response.data.orders);
      } else {
        setError('Unexpected data structure in the response.');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch orders. Please try again.');
      setLoading(false);
    }
  };

  const handleOrderClick = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleShopNow = () => {
    navigate('/');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };

  const formatPrice = (price) => {
    const numPrice = Number(price);
    return isNaN(numPrice) ? 'N/A' : `₹${numPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="mt-4 text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h3 className="font-bold mb-2">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Helmet>
        <title>Orders | Rolecart</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <ShoppingBag className="h-16 w-16 text-gray-400" />
              <Package className="h-8 w-8 text-blue-500 absolute -bottom-2 -right-2 animate-bounce" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">
            Ready to start your shopping journey? Explore our amazing products and find something you'll love!
          </p>
          <button
            onClick={handleShopNow}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Start Shopping
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {orders.map((order) => (
            <div 
              key={order.id} 
              onClick={() => handleOrderClick(order.id)}
              className="p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="text-sm text-gray-600">{formatDate(order.ordered_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(order.total_price)}</p>
                  <div className={`text-sm px-2 py-1 rounded-full inline-block
                    ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {order.status}
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm font-semibold">Items:</p>
                {order.items?.map((item, itemIndex) => (
                  <div key={itemIndex} className="text-sm py-1">
                    <span className="font-medium">{item.product}</span>
                    <span className="text-gray-600"> - Quantity: {item.quantity}</span>
                    <span className="text-gray-600">, Price: {formatPrice(item.price)}</span>
                  </div>
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