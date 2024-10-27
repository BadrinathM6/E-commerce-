import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../Home/Navbar'
import ProductContent from './ProductContent';
import ProductImages from './ProductImages';
import ProductReview from './ProductReview';
import ProductReviewForm from './ProductReviewform'; // Corrected to match the filename
import SimilarProducts from './SimiliarProducts'; // Corrected the spelling
import axiosInstance from '../utils/axiosConfig';
import LoadingAnimation from '../Home/Loader';
import { Helmet } from 'react-helmet';

const ProductPage = () => {
  const { productId } = useParams(); // Correctly call useParams to get productId
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [error, setError] = useState(null); // Initialize error state
  const [reviews, setReviews] = useState([]); // State to hold reviews

  // Function to update quantity
  const updateQuantity = (change) => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity + change));
  };

  // Fetch product details and reviews when the component mounts or productId changes
  useEffect(() => {
    const fetchProductDetails = async (productId) => {
      try {
        if (productId) {
          console.log("Product ID:", productId);
          const response = await axiosInstance.get(`/product/${productId}/`);
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

    const fetchReviews = async () => {
      try {
        const response = await axiosInstance.get(`/product/${productId}/reviews/`);
        setReviews(response.data.reviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchProductDetails(productId); // Call fetchProductDetails with the productId
    fetchReviews(); // Fetch reviews for the product
  }, [productId]); // Dependencies array should contain productId

  // Function to refresh reviews
  const handleReviewSubmitted = async () => {
    try {
      const response = await axiosInstance.get(`/product/${productId}/submit-review/`);
      setReviews(response.data); // Refresh reviews after a new review is submitted
    } catch (error) {
      console.error("Error refreshing reviews:", error);
    }
  };

  // Handle loading state
  if (loading) {
    return (
        <>
            <Navbar />
            <LoadingAnimation />
        </>
    );
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
    <div>
      <Helmet>
        <title>{product.name}| Rolecart</title>
        <link 
          rel="icon" 
          href="https://res.cloudinary.com/dmohbdzs1/image/upload/v1730048690/fixed-removebg-preview_prw8l9.png" 
        />
      </Helmet>
      
      <Navbar/>
      <div className="container mx-auto p-4">
        <ProductImages productId={productId} />
        <ProductContent
          productId={productId}
          quantity={quantity}
          updateQuantity={updateQuantity}
        />
        <ProductReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />
        <ProductReview productId={productId} reviews={reviews} /> {/* Pass reviews to ProductReview */}
        <SimilarProducts productId={productId} />
      </div>
    </div>
  );
};

export default ProductPage;
