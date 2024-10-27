import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosConfig';

const SimilarProducts = ({ productId }) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        const response = await axiosInstance.get(`/product/${productId}/`);
        setSimilarProducts(response.data.similar_products);
      } catch (error) {
        console.error("Error fetching similar products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProducts();
  }, [productId]);

  if (loading) {
    return <div className="text-center py-8">Loading similar products...</div>;
  }

  return (
    <div className="mt-6">
      <style jsx="true">{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none; 
                }
      `}</style>
      <h2 className="text-xl font-semibold mb-4">Similar Products</h2>
      <div className="relative overflow-hidden">
        <div className="flex overflow-x-scroll space-x-4 scrollbar-hide no-scrollbar px-4 snap-x snap-mandatory">
          {similarProducts.map((product) => (
            <a href={`https://rolexcart-ecomerce.web.app/product/${product.id}`} key={product.id}>
              <div
                key={product.id}
                className="w-28 sm:w-[240px] border rounded-lg p-4 shadow-sm bg-white flex-shrink-0"
              >
                <img
                  src={product.main_image}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-auto rounded-lg mb-2"
                />
                <h3 className="text-lg font-medium line-clamp-1">{product.name}</h3>
                <span className="text-green-700 font-semibold text-center">
                  ₹{Number(product.discounted_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimilarProducts;
