import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import axiosInstance from '../utils/axiosConfig';


const WishlistButton = ({ productId }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkWishlistStatus();
  }, [productId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await axiosInstance.get(`/wishlist/check/${productId}/`);
      setIsWishlisted(response.data.is_wishlisted);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      setIsLoading(false);
    }
  };

  const toggleWishlist = async () => {
    try {
      const response = await axiosInstance.post(`/wishlist/toggle/${productId}/`);
      setIsWishlisted(response.data.status === 'added');
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist();
      }}
      className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
    >
      <Heart
        className={`w-5 h-5 ${
          isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
        }`}
      />
    </button>
  );
};

export default WishlistButton;