import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { useLoading } from './LoadingContext';

const DealProduct = () => {
    const [dealProducts, setDealProducts] = useState([]);
    const [error, setError] = useState(null);
    const { startLoading, stopLoading } = useLoading();

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
        let mounted = true;
        const loadId = 'dealProducts-' + Date.now();
    
        const fetchDealProducts = async () => {
          try {
            startLoading(loadId);
            const response = await axiosInstance.get('');
            
            if (mounted) {
              setDealProducts(response.data.deal_products || []);
              setError(null);
            }
          } catch (error) {
            console.error("Error fetching deal products:", error);
            if (mounted) {
              setError('Failed to load deal products');
            }
          } finally {
            if (mounted) {
              stopLoading(loadId);
            }
          }
        };
    
        fetchDealProducts();
    
        return () => {
          mounted = false;
          stopLoading(loadId);
        };
      }, []);

    if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 py-8">
            {dealProducts.length > 0 ? (
                dealProducts.map(product => (
                    <a key={product.id} href={`https://rolexcart-ecomerce.web.app/product/${product.id}`} 
                       className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="p-4">
                            <div className="relative w-full pb-[100%]">
                                <img
                                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                    src={getValidImageUrl(product.main_image)}
                                    alt={product.name}
                                    loading="lazy"
                                    onError={(e) => {
                                        console.log('Image load error:', e.target.src);
                                        e.target.onerror = null;
                                        e.target.src = '/placeholder-image.jpg';
                                    }}
                                />
                            </div>
                            <p className="text-gray-800 mt-3 text-sm">{product.short_desc}</p>
                            <h6 className="text-lg font-bold mt-2 text-green-600">{product.short_disc}</h6>
                        </div>
                    </a>
                ))
            ) : (
                <p className="col-span-full text-center text-gray-500">No deal products available.</p>
            )}
        </div>
    );
};

export default DealProduct