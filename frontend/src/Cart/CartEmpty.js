import React from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm">
      <div className="bg-gray-50 p-6 rounded-full mb-6">
        <ShoppingCart className="w-16 h-16 text-gray-400" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Your cart is empty
      </h2>
      
      <p className="text-gray-500 text-center max-w-md mb-8">
        Looks like you haven't added anything to your cart yet. 
        Browse our products and find something you'll love!
      </p>

      <button
        onClick={() => navigate('/')}
        className="group flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
      >
        Start Shopping
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>

      <div className="mt-8 grid grid-cols-3 gap-6 text-center max-w-2xl">
        <div className="p-4">
          <div className="text-yellow-500 font-bold text-xl mb-2">Fast Delivery</div>
          <p className="text-gray-500 text-sm">Get your items delivered within 2 days</p>
        </div>
        <div className="p-4">
          <div className="text-yellow-500 font-bold text-xl mb-2">Secure Payment</div>
          <p className="text-gray-500 text-sm">Multiple payment options available</p>
        </div>
        <div className="p-4">
          <div className="text-yellow-500 font-bold text-xl mb-2">24/7 Support</div>
          <p className="text-gray-500 text-sm">Get help whenever you need it</p>
        </div>
      </div>
    </div>
  );
};

export default EmptyCart;