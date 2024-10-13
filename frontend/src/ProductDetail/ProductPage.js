import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ProductContent from './ProductContent';
import ProductImages from './ProductImages';
import ProductReview from './ProductReview';
import ProductReviewForm from './ProductReviewform'; // Corrected to match the filename
import SimilarProducts from './SimiliarProducts'; // Corrected the spelling

const ProductPage = () => {
  const { productId } = useParams(); // Correctly call useParams to get productId
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [error, setError] = useState(null); // Initialize error state

  // Function to update quantity
  const updateQuantity = (change) => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity + change));
  };

  // Fetch product details when the component mounts or productId changes
  useEffect(() => {
    const fetchProductDetails = async (productId) => {
      try {
        if (productId) {
          console.log("Product ID:", productId);
          const response = await axios.get(`http://127.0.0.1:8000/product/${productId}/`);
          console.log("API Response:", response.data);
          const productData = response.data;

          console.log("Product data before setting state:", productData); // Add this line


          if (productData) {
            setProduct(productData); // Set product if data is valid
          } else {
            setError("Product not found.");
          }
        } else {
          console.error('Product ID is undefined');
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        setError("Failed to load product details. Please try again.");
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchProductDetails(productId); // Call fetchProductDetails with the productId
  }, [productId]); // Dependencies array should contain productId

  // Handle loading state
  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  // Handle error state
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  // Check if product data is available
  if (!product) {
    return <div className="text-center py-8">Product not found at this moment.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <ProductImages productId={productId} />
      <ProductContent
        productId={productId}
        quantity={quantity}
        updateQuantity={updateQuantity}
      />
      <ProductReviewForm productId={productId} />
      <ProductReview productId={productId} />
      <SimilarProducts productId={productId} />
    </div>
  );
};

export default ProductPage;
