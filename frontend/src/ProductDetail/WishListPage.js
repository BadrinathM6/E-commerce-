import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { Trash2 } from 'lucide-react';
import { Star } from 'lucide-react';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const fetchWishlistItems = async () => {
    try {
      const response = await axiosInstance.get('/wishlist/');
      setWishlistItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await axiosInstance.delete(`/wishlist/remove/${productId}/`);
      setWishlistItems(wishlistItems.filter(item => item.product.id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      
      {wishlistItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Your wishlist is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="flex items-center border rounded-lg p-4 shadow-sm">
              <img
                src={item.product.main_image}
                alt={item.product.name}
                className="w-24 h-24 object-cover rounded-md"
              />
              
              <div className="flex-grow ml-4">
                <h3 className="font-semibold text-lg">{item.product.name}</h3>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`w-4 h-4 ${
                        index < Math.floor(item.product.average_rating)
                          ? 'text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    ({item.product.number_of_reviews} reviews)
                  </span>
                </div>
                <p className="text-green-600 font-semibold mt-1">
                ₹{Number(item.product.discounted_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
              
              <button
                onClick={() => handleRemoveFromWishlist(item.product.id)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;