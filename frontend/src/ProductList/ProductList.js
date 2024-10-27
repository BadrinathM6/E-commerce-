import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import Navbar from '../Home/Navbar';
import { useNavigate } from 'react-router-dom';
import WishlistButton from '../ProductDetail/WishListButton';

const ProductList = (productId) => {
    const [product_data, setProductData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
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
                if (error.response?.status === 401) {
                    // Only redirect to login if explicitly unauthorized
                    const currentPath = window.location.pathname + window.location.search;
                    navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
                } else {
                    setError('Failed to load products. Please try again later.');
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
    }, [navigate]); 

    const ratingStars = (averageRating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (averageRating >= i) {
                stars.push(<span key={i} className="fa fa-star text-yellow-400"></span>);
            } else if (averageRating >= i - 0.5) {
                stars.push(<span key={i} className="fa fa-star-half-alt text-yellow-400"></span>);
            } else {
                stars.push(<span key={i} className="fa fa-star text-gray-300"></span>);
            }
        }
        return stars;
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-center py-8">Loading...</div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-center py-8 text-red-600">{error}</div>
                </div>
            </>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="flex flex-wrap justify-center gap-4 p-4">
                {product_data.length > 0 ? (
                    product_data.map((product) => (
                        <div key={product.id} className="relative">
                            <WishlistButton productId={product.id} /> {/* Pass the product ID here */}
                            <a href={`/product/${product.id}`} className="no-underline text-inherit">
                                <div className="flex border border-gray-300 p-4 rounded-lg w-screen hover:shadow-md transition-shadow duration-300">
                                    <div className="w-32 h-32 overflow-hidden mr-4">
                                        <img src={product.main_image}
                                            alt={product.name}
                                            loading="lazy"
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
                        </div>
                    ))
                ) : (
                    <div className="text-center">No products found</div>
                )}
            </div>
        </div>
    );
}

export default ProductList;