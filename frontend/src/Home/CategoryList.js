import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosConfig';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return '/placeholder-image.jpg';
        
        try {
            // Decode the URL first
            let decodedUrl = decodeURIComponent(imageUrl);
            
            // Remove any newline characters and trailing/leading whitespace
            decodedUrl = decodedUrl.replace(/\n/g, '').trim();
            
            // Extract the Cloudinary URL
            const match = decodedUrl.match(/(https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/[^\/\n\s]+)/);
            
            if (match) {
                return match[0]; // Return the matched Cloudinary URL
            }
            
            return '/placeholder-image.jpg';
        } catch (error) {
            console.error('Error processing image URL:', error);
            return '/placeholder-image.jpg';
        }
    };

    // Rest of your component remains the same...
    useEffect(() => {
        axiosInstance.get('') // Make sure this is the correct endpoint
        .then((response) => {
            console.log(response.data);
            if (response.data && response.data.categories) {
                setCategories(response.data.categories);
            } else {
                setError('No categories found in the response');
            }
            setLoading(false);
        })
        .catch((error) => {
            console.error("Error fetching categories", error);
            setError('Failed to fetch categories');
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="w-full my-4">
            <style jsx="true">{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none; 
                }
            `}</style>

            <div className="overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full lg:overflow-visible lg:max-w-none">
                <ul className="flex space-x-6">
                    {categories.map((category, index) => (
                        <li key={category.id ? category.id : `category-${index}`} className="inline-block text-center">
                            <a href={`https://rolexcart-ecomerce.web.app/product-list?category=${category.id}`}>
                                <img 
                                    className="w-12 h-12 object-cover rounded-full mb-2" 
                                    src={getImageUrl(category.image_url)}
                                    alt={category.name}
                                    onError={(e) => {
                                        e.target.src = '/placeholder-image.jpg';
                                    }}
                                />
                                <span className="text-sm text-blue-600">{category.name}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CategoryList;