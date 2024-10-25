import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosConfig';

const TrendingProducts = () => {
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://djangoecommrce.vercel.app';

    // Helper function to get complete image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return ''; // Handle null/undefined image paths
        
        // If the image path is already a full URL, return it as is
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        // Remove any leading slash to avoid double slashes
        const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
        return `${API_BASE_URL}/${cleanPath}`;
    };

    useEffect(() => {
        const fetchTrendingProducts = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/trending-products/'); // Adjust this endpoint to match your backend
                setTrendingProducts(response.data.trending_products);
                setError(null);
            } catch (err) {
                console.error("Error fetching trending products:", err);
                setError('Failed to load trending products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchTrendingProducts();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8 text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-6 px-4 py-8">
            {trendingProducts.length > 0 ? (
                trendingProducts.map(product => (
                    <a
                        key={product.id}
                        href={`/product/${product.id}`}
                        className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                        <div className="p-4">
                            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg">
                                <img
                                    className="w-full h-48 object-cover rounded-lg"
                                    src={getImageUrl(product.main_image)}
                                    alt={product.name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/placeholder-image.jpg'; // Add a placeholder image
                                    }}
                                />
                            </div>
                            <p className="text-gray-800 mt-3 text-sm line-clamp-2">
                                {product.short_desc}
                            </p>
                            <h6 className="text-lg font-bold mt-2 text-green-600">
                                {product.short_disc}
                            </h6>
                        </div>
                    </a>
                ))
            ) : (
                <div className="col-span-full text-center text-gray-500 py-8">
                    No trending products available at the moment.
                </div>
            )}
        </div>
    );
};

export default TrendingProducts;