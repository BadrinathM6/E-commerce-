import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig'

const OrderPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { orderId } = useParams();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axiosInstance.get(`/orders/${orderId}/`);
        setOrder(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch order details');
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!order) return <div className="text-center py-8">Order not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Order Details</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Order #{order.id}</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600">Order Date:</p>
              <p className="font-medium">{new Date(order.ordered_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Status:</p>
              <p className="font-medium capitalize">{order.status}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Price:</p>
              <p className="font-medium">₹{Number(order.total_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
          <p className="mb-6">{order.shipping_address}</p>
          <h3 className="text-lg font-semibold mb-3">Order Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3">Product</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3">{item.product}</td>
                    <td className="p-3">{item.quantity}</td>
                    <td className="p-3">₹{Number(item.price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className="p-3">₹{Number(item.quantity * item.price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;