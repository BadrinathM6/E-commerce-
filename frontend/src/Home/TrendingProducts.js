import React, {useEffect, useState} from 'react';
import axios from 'axios';

const TrendingProducts = () => {

    const [trending_products, settrending_products] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/')
        .then((response) => {
            console.log(response.data.trending_products);
            settrending_products(response.data.trending_products);  // Ensure you're setting this correctly
            setLoading(false);
        })
        .catch((error) => {
            console.error("Error fetching trending_products", error);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-6 px-4 py-8">
        {trending_products.length ? (
            trending_products.map(trending_product => (
            <a
                key={trending_product.id}
                href={`/product/${trending_product.id}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
                <div className="p-4">
                <img
                    className="w-full h-50 object-cover rounded-lg"
                    src={`http://localhost:8000${trending_product.main_image_url}`}
                    alt={trending_product.name}
                />
                <p className="text-gray-800 mt-3 text-sm">{trending_product.short_desc}</p>
                <h6 className="text-lg font-bold mt-2 text-gray-900">{trending_product.short_disc}</h6>
                </div>
            </a>
            ))
        ) : (
            <p className="text-center text-gray-500">No trending products available at the moment.</p>
        )}
        </div>
    );
};

export default TrendingProducts;
