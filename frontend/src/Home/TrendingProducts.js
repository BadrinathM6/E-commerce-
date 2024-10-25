import React, { useEffect, useState } from 'react';
import ProductImage from './ProductImage';
import axiosInstance from '../utils/axiosConfig';

const TrendingProducts = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const response = await axiosInstance.get('');
        console.log('Trending products response:', response.data);
        // Ensure we're accessing the correct property in the response
        const products = Array.isArray(response.data) ? response.data : 
                        response.data.trending_products || [];
        setTrendingProducts(products);
        setError(null);
      } catch (err) {
        console.error("Error fetching trending products:", err);
        setError('Failed to load trending products');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-pulse text-gray-600">Loading products...</div>
    </div>
  );

  if (error) return (
    <div className="text-center py-8">
      <p className="text-red-600">{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-6 px-4 py-8">
      {trendingProducts.length > 0 ? (
        trendingProducts.map(product => (
          <a 
            key={product.id} 
            href={`/product/${product.id}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-4">
              <div className="relative w-full pb-[100%]">
                <ProductImage
                  imageUrl={product.main_image}
                  productName={product.name}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                  {product.short_name || product.name}
                </h3>
                {product.short_desc && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {product.short_desc}
                  </p>
                )}
                {product.short_disc && (
                  <p className="mt-2 text-lg font-bold text-green-600">
                    {product.short_disc}
                  </p>
                )}
              </div>
            </div>
          </a>
        ))
      ) : (
        <p className="col-span-full text-center text-gray-500">
          No trending products available.
        </p>
      )}
    </div>
  );
};

export default TrendingProducts;