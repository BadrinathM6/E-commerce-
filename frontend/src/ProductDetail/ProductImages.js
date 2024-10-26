import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosConfig';
import WishlistButton from './WishListButton';

const ProductImages = ({ productId }) => {
    const [productData, setProductData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState('');

    useEffect(() => {
        axiosInstance.get(`/product/${productId}/`)
            .then((response) => {
                console.log("Response data:", response.data);
                setProductData(response.data);
                setMainImage(response.data.main_image);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching product data", error);
                setLoading(false);
            });
    }, [productId]);

    const changeImage = (src) => {
        setMainImage(src);
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="flex flex-col items-center space-y-4">
            <style jsx="true">{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none; 
                }
            `}</style>

            <div className="relative">
                <WishlistButton productId={productId} />
                <img 
                    src={mainImage}
                    alt={productData.name} 
                    className="w-full max-w-lg h-auto rounded-lg object-cover" 
                />
            </div>

            {/* Thumbnails */}
            <div className="flex mt-4 space-x-2 overflow-x-auto scrollbar-hide">
                {productData.thumbnails.map((thumbnail, index) => (
                    <img
                        key={index}
                        src={thumbnail.image}
                        alt={`Thumbnail for ${productData.name}`}
                        className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 cursor-pointer rounded-lg border-2 border-transparent hover:border-gray-300 transition-all duration-300"
                        onClick={() => changeImage(thumbnail.image)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProductImages;
