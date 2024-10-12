import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/')
        .then((response) => {
            setCategories(response.data.categories);
            setLoading(false);
        })
        .catch((error) => {
            console.error("Error fetching categories", error);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
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
                            <a href={`/product-list?category=${category.id}`}>
                                <img className="w-12 h-12 object-cover rounded-full mb-2" 
                                     src={`http://127.0.0.1:8000${category.image_url}`}
                                     alt={category.name} />
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
