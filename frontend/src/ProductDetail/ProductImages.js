import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductImages = ({ productId }) => {
    const [productData, setProductData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState('');

    useEffect(() => {
        axios.get(`http://127.0.0.1:8000/product/${productId}/`)
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
            <img 
                src={`http://localhost:8000${mainImage}`} 
                alt={productData.name} 
                className="w-full max-w-lg h-auto rounded-lg object-cover" 
            />

            {/* Thumbnails */}
            <div className="flex mt-4 space-x-2 overflow-x-auto scrollbar-hide">
                {productData.thumbnails.map((thumbnail, index) => (
                    <img
                        key={index}
                        src={`http://localhost:8000${thumbnail.image}`}
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