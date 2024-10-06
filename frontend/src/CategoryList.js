import React, { useEffect, useState } from 'react'
import axios from 'axios';

const CategoryList = () => {

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/')
        .then((response) => {
            console.log(response.data.categories);
            setCategories(response.data.categories);  // Ensure you're setting this correctly
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
        <fieldset id="f1" className="my-4" >
            <ul className="flex flex-wrap gap-2 justify-around" >
                {categories.map((category, index) => {
                    return (
                        <li key={category.id ? category.id : `category-${index}`} className="text-center rounded">
                            <a href={`/product-list?category=${category.id}`}>
                                <img className="w-14 h-14 object-cover mb-2 rounded-full" 
                                     src={`http://127.0.0.1:8000${category.image_url}`}
                                     alt={category.name} />
                                <span className="text-md text-blue-600">{category.name}</span>
                            </a>
                        </li>
                    );
                })}
            </ul>
        </fieldset>
    );
};

export default CategoryList;
