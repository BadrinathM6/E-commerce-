import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductContent = ({ productId, quantity, updateQuantity }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNameExpanded, setIsNameExpanded] = useState(false);

  const maxNameLength = 50;

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/product/${productId}/`);
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [productId]);

  const toggleNameExpansion = () => {
    setIsNameExpanded(!isNameExpanded);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center py-8">Product not found.</div>;
  }

  const renderProductName = () => {
    if (product.name.length <= maxNameLength) {
      return product.name; 
    }

    return (
      <>
        {isNameExpanded ? product.name : `${product.name.substring(0, maxNameLength)}...`}
        <button
          onClick={toggleNameExpansion}
          className="ml-1 text-blue-500 hover:text-blue-700 focus:outline-none"
        >
          {isNameExpanded ? 'Show Less' : 'More'}
        </button>
      </>
    );
  };

  // Split product description into an array of points
  const descriptionPoints = product.description.split('*').filter(point => point.trim() !== '');

  return (
    <div className="flex flex-col p-4 bg-white rounded-lg shadow-md space-y-4 md:space-y-6 lg:space-y-8 md:max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
        {renderProductName()}
      </h1>
      
      <div className="mt-2">
        {/* Render product description as a list of bullet points */}
        <ul className="list-disc list-inside text-gray-600 text-sm md:text-base lg:text-lg space-y-1">
          {descriptionPoints.map((point, index) => (
            <li key={index} className="leading-relaxed">
              {point.trim()}.
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-4 flex items-center space-x-2">
        <span className="text-lg font-semibold text-gray-800">Rating: {product.rating}</span>
        <div className="flex">
          {[...Array(5)].map((_, index) => (
            <span
              key={index}
              className={`fa fa-star ${index < product.average_rating ? 'text-yellow-500' : 'text-gray-400'}`}
            ></span>
          ))}
        </div>
      </div>

      <p className="mt-2 text-xl md:text-2xl font-bold text-gray-800">
        {Number(product.discount_percentage).toFixed(0) ? (
          <>
            <span className="line-through text-gray-500">₹{Number(product.original_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            <span className="text-red-500"> ₹{Number(product.discounted_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            <span className="text-green-500"> ({Number(product.discount_percentage).toFixed(0)}% OFF)</span>
          </>
        ) : (
          <>₹{Number(product.original_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</>
        )}
      </p>

      <div className="flex items-center mt-4 space-x-2">
        <button
          onClick={() => updateQuantity(-1)}
          className="px-3 py-1 bg-gray-200 rounded-l hover:bg-gray-300 transition"
        >
          -
        </button>
        <span className="mx-2 text-lg font-medium">{quantity}</span>
        <button
          onClick={() => updateQuantity(1)}
          className="px-3 py-1 bg-gray-200 rounded-r hover:bg-gray-300 transition"
        >
          +
        </button>
      </div>

      <div className="mt-4 space-y-2">
        <button className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
          Add to Cart
        </button>
        <button className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductContent;
