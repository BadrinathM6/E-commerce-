import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DealProduct = () => {
    const [dealProducts, setDealProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/')
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
        <div className="container mx-auto my-8 px-4">
            {dealProducts && dealProducts.length > 0 ? (
                <div className="product-container flex flex-col md:flex-row gap-5 max-w-6xl mx-auto">
                    {/* Left Side - Large Image Card */}
                    <div className="product-large flex-grow md:w-1/2">
                        <div className="product-card bg-white rounded-lg overflow-hidden shadow-md h-full flex flex-col">
                            <div className="relative h-96 md:h-[calc(100%-6rem)]">
                                <img
                                    src={`http://127.0.0.1:8000${dealProducts[0].main_image_url}`}
                                    alt={dealProducts[0].short_desc}
                                    className="absolute w-full h-full object-cover"
                                />
                            </div>
                            <div className="product-info p-4 flex-grow">
                                <h2 className="product-title text-lg font-bold mb-2 overflow-hidden overflow-ellipsis whitespace-nowrap">{dealProducts[0].short_desc}</h2>
                                <p className="product-price text-xl font-bold">{dealProducts[0].short_disc}</p>
                                <p className="discount text-green-600 text-sm">Special Deal</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Two Smaller Cards */}
                    <div className="product-small-container flex-1 md:w-1/2 flex flex-col gap-5">
                        {dealProducts.slice(1, 3).map((product, index) => (
                            <div key={index} className="product-card bg-white rounded-lg overflow-hidden shadow-md flex-1">
                                <div className="relative h-48">
                                    <img
                                        src={`http://127.0.0.1:8000${product.main_image_url}`}
                                        alt={product.short_desc}
                                        className="absolute w-full h-full object-cover"
                                    />
                                </div>
                                <div className="product-info p-4">
                                    <h2 className="product-title text-base font-semibold mb-2 overflow-hidden overflow-ellipsis whitespace-nowrap">{product.short_desc}</h2>
                                    <p className="product-price text-lg font-bold">{product.short_disc}</p>
                                    <p className="discount text-green-600 text-xs">Limited Time Offer</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-500">No Deal available at the moment.</p>
            )}
        </div>
    );
};

export default DealProduct;