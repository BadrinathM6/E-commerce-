import React, { useState } from 'react';
import axiosInstance from '../utils/axiosConfig';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5); // Default rating
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post(`/product/${productId}/submit-review/`, {
        text,
        rating,
      });
      setText('');
      setRating(5);
      onReviewSubmitted(); // Call the function to refresh the reviews
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Leave a Review</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows="4"
        className="w-full border rounded-lg p-2"
        placeholder="Write your review..."
        required
      />
      <div className="flex items-center mt-2">
        <span className="mr-2">Rating:</span>
        {[1, 2, 3, 4, 5].map((value) => (
          <label key={value} className="mr-1 cursor-pointer">
            <input
              type="radio"
              value={value}
              checked={rating === value}
              onChange={() => setRating(value)}
              className="hidden"
            />
            <span className={`fa fa-star ${value <= rating ? 'text-yellow-500' : 'text-gray-400'}`}></span>
          </label>
        ))}
      </div>
      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;
