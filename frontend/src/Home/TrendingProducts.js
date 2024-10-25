import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosConfig';

const TrendingProducts = () => {
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isValidImageUrl = (url) => {
        if (!url) return false;
        return url.includes('cloudinary.com') && 
               url.includes('/upload/') && 
               !url.endsWith('cloudinary') && 
               !url.endsWith('cloudinary.com');
    };

    const getValidImageUrl = (url) => {
        if (!isValidImageUrl(url)) {
            console.warn('Invalid image URL detected:', url);
            return '/placeholder-image.jpg';
        }
        // Ensure URL ends with file extension if missing
        if (!url.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return `${url}.jpg`;
        }
        return url;
    };

    useEffect(() => {
        const fetchTrendingProducts = async () => {
            try {
                const response = await axiosInstance.get('');
                console.log('Trending products response:', response.data);
                setTrendingProducts(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching trending products:", err);
                setError('Failed to load trending products');
            } finally {
                setLoading(false);
            }
        };

        fetchTrendingProducts();
    }, []);

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-6 px-4 py-8">
            {trendingProducts.length > 0 ? (
                trendingProducts.map(product => (
                    <a key={product.id} href={`/product/${product.id}`}
                       className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="p-4">
                            <div className="relative w-full pb-[100%]">
                                <img
                                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                    src={getValidImageUrl(product.main_image)}
                                    alt={product.name}
                                    onError={(e) => {
                                        console.log('Image load error:', e.target.src);
                                        e.target.onerror = null;
                                        e.target.src = '/placeholder-image.jpg';
                                    }}
                                />
                            </div>
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-900">{product.short_name}</h3>
                                <p className="mt-1 text-sm text-gray-500">{product.short_desc}</p>
                                <p className="mt-2 text-lg font-bold text-green-600">{product.short_disc}</p>
                            </div>
                        </div>
                    </a>
                ))
            ) : (
                <p className="col-span-full text-center text-gray-500">No trending products available.</p>
            )}
        </div>
    );
};

export default TrendingProducts;