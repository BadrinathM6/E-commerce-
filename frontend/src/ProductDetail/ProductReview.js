import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosConfig'

const Review = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axiosInstance.get(`/product/${productId}/`);
        setReviews(response.data.reviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Reviews</h2>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="border-b py-2">
            <h3 className="font-medium">{review.user}</h3>
            <p className="text-gray-600">{review.text}</p>
            <div className="flex mt-1">
              {[...Array(5)].map((_, index) => (
                <span key={index} className={`fa fa-star ${index < review.rating ? 'text-yellow-500' : 'text-gray-400'}`}></span>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Review;
