import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { useLoading } from './LoadingContext';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const { startLoading, stopLoading } = useLoading(); // Add loading context

    useEffect(() => {
        const fetchCategories = async () => {
            startLoading('categories'); // Start loading
            try {
                const response = await axiosInstance.get(''); // Adjust endpoint if needed
                if (response.data && response.data.categories) {
                    setCategories(response.data.categories);
                    setError(null);
                } else {
                    setError('No categories found in the response');
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                setError('Failed to fetch categories');
            } finally {
                stopLoading('categories'); // Stop loading
            }
        };

        fetchCategories();
    }, [startLoading, stopLoading]);

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
                                    src={category.image_url}
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
