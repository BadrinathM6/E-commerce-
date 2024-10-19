import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

const DealProduct = () => {
    const [dealProducts, setDealProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosInstance.get('')
            .then((response) => {
                console.log("Response data:", response.data.deal_products);
                setDealProducts(response.data.deal_products);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching deal_products", error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 py-8">
        {dealProducts.length ? (
            dealProducts.map(dealproduct => (
            <a
                key={dealproduct.id}
                href={`/product/${dealproduct.id}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
                <div className="p-4">
                <img
                    className="w-full h-50 object-cover rounded-lg"
                    src={`http://localhost:8000${dealproduct.main_image}`}
                    alt={dealproduct.name}
                />
                <p className="text-gray-800 mt-3 text-sm">{dealproduct.short_desc}</p>
                <h6 className="text-lg font-bold mt-2 text-green-600">{dealproduct.short_disc}</h6>
                </div>
            </a>
            ))
        ) : (
            <p className="text-center text-gray-500">No available products available at the moment.</p>
        )}
        </div>
    );
};

export default DealProduct;
