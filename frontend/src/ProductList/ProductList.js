import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import Navbar from '../Home/Navbar';

const ProductList = () => {
    const [product_data, setProductData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const category = urlParams.get('category') || '';
                const searchQuery = urlParams.get('q') || '';

                const url = `/product-list/?category=${category}&q=${searchQuery}`;
                
                console.log("Fetching data from URL: ", url);
                const response = await axiosInstance.get(url);
                console.log("Response data:", response.data);
                setProductData(response.data.product_data);
            } catch (error) {
                console.error("Error fetching product data", error);
                if (error.response) {
                    console.error("Error response data:", error.response.data);
                    console.error("Error response status:", error.response.status);
                    console.error("Error response headers:", error.response.headers);
                } else if (error.request) {
                    console.error("Error request:", error.request);
                } else {
                    console.error('Error message:', error.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

        // Add an event listener for URL changes
        const handleURLChange = () => {
            fetchProducts();
        };

        window.addEventListener('popstate', handleURLChange);

        // Clean up the event listener
        return () => {
            window.removeEventListener('popstate', handleURLChange);
        };
    }, []); // Only run once on mount, no dependencies needed here

    const ratingStars = (averageRating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (averageRating >= i) {
                stars.push(<span key={i} className="fa fa-star text-yellow-400"></span>); // Full Star
            } else if (averageRating >= i - 0.5) {
                stars.push(<span key={i} className="fa fa-star-half-alt text-yellow-400"></span>); // Half Star
            } else {
                stars.push(<span key={i} className="fa fa-star text-gray-300"></span>); // Empty Star
            }
        }
        return stars;
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div>
            <Navbar/>
            <div className="flex flex-wrap justify-center gap-4 p-4">
                {product_data.length > 0 ? (
                    product_data.map((product) => (
                        <a href={`/product/${product.id}`} key={product.id} className="no-underline text-inherit">
                            <div className="flex border border-gray-300 p-4 rounded-lg w-screen hover:shadow-md transition-shadow duration-300">
                                <div className="w-32 h-32 overflow-hidden mr-4">
                                    <img src={`http://localhost:8000${product.main_image}`}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-sm md:text-lg font-bold mb-2 line-clamp-2 md:line-clamp-1">{product.name}</h2>
                                    <div className="flex items-center mb-2">
                                        {product.review_count === 0 ? (
                                            <>
                                                <span className="text-sm text-gray-500 mr-2">No ratings yet</span>
                                                <span className="flex">{ratingStars(0)}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="flex">{ratingStars(product.average_rating)}</span>
                                                <span className="text-sm text-gray-600 ml-2">({product.number_of_reviews})</span>
                                            </>
                                        )}
                                        <span className="ml-2 text-green-500">✅</span>
                                    </div>
                                    <div className="flex items-center mb-2">
                                        <span className="text-green-600 font-semibold mr-2">{Number(product.discount_percentage).toFixed(0)}%</span>
                                        <span className="line-through text-gray-500 mr-2">₹{Number(product.original_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                        <span className="font-bold text-black">₹{Number(product.discounted_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    ))
                ) : (
                    <div className="text-center">No products found</div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
