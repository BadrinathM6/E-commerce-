import React, { useState, useEffect } from 'react';
import { UserCircle, ShoppingCart, Package } from 'lucide-react';
import axiosInstance from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get('/user-profile/');
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user profile. Please try again.');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="text-center mt-8">No user data available.</div>;
  }

  const handleViewCart = () => {
    navigate('/cart');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-6">
          <UserCircle className="w-24 h-24 text-blue-500 mr-4" />
          <div>
            <h1 className="text-3xl font-bold">Hi, {user.username}!</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={handleViewCart}
            className="flex items-center justify-center bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            <ShoppingCart className="mr-2" />
            View Cart
          </button>
          <button 
            onClick={handleViewOrders}
            className="flex items-center justify-center bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
          >
            <Package className="mr-2" />
            My Orders
          </button>
        </div>
        
        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Profile Details</h2>
          <p><strong>Full Name:</strong> {user.full_name || 'Not provided'}</p>
          <p><strong>Phone:</strong> {user.phone_number || 'Not provided'}</p>
          <p><strong>Member Since:</strong> {new Date(user.date_joined).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;