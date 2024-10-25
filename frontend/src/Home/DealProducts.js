import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

const DealProduct = () => {
    const [dealProducts, setDealProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isValidImageUrl = (url) => {
        if (!url) return false;
        // Basic validation for Cloudinary URLs
        return url.includes('cloudinary.com') && url.includes('/upload/');
    };

    const getValidImageUrl = (url) => {
        if (!isValidImageUrl(url)) {
            console.warn('Invalid image URL detected:', url);
            return '/placeholder-image.jpg';
        }
        return url;
    };

    useEffect(() => {
        const fetchDealProducts = async () => {
            try {
                const response = await axiosInstance.get('');
                console.log("Response data:", response.data.deal_products);
                setDealProducts(response.data.deal_products);
                setError(null);
            } catch (error) {
                console.error("Error fetching deal products:", error);
                setError('Failed to load deal products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchDealProducts();
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
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 py-8">
            {dealProducts.length > 0 ? (
                dealProducts.map(dealProduct => (
                    <a
                        key={dealProduct.id}
                        href={`/product/${dealProduct.id}`}
                        className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                        <div className="p-4">
                            <div className="relative w-full pb-[100%]">
                                <img
                                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                    src={getValidImageUrl(dealProduct.main_image)}
                                    alt={dealProduct.name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/placeholder-image.jpg';
                                    }}
                                />
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-gray-800 line-clamp-2">
                                    {dealProduct.short_desc}
                                </p>
                                <h6 className="text-lg font-bold mt-2 text-green-600">
                                    {dealProduct.short_disc}
                                </h6>
                            </div>
                        </div>
                    </a>
                ))
            ) : (
                <div className="col-span-full text-center text-gray-500 py-8">
                    No deal products available at the moment.
                </div>
            )}
        </div>
    );
};

export default DealProduct;