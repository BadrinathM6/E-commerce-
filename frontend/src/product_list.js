import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DealProduct = () => {
    const [product_data, setProductData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/product-list/')
            .then((response) => {
                console.log("Response data:", response.data.product_data);
                setProductData(response.data.product_data);
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

    return(
        <div>
            <img
                src='product_data.image'
                alt='product_data.name'
                className=''
            
            
            />
        </div>
    )
}