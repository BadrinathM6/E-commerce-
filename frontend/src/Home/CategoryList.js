import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { useLoading } from './LoadingContext';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    let mounted = true;
    const loadId = 'categories-' + Date.now();

    const fetchCategories = async () => {
      try {
        startLoading(loadId);
        const response = await axiosInstance.get('');
        
        if (mounted) {
          if (response.data && response.data.categories) {
            setCategories(response.data.categories);
            setError(null);
          } else {
            setError('No categories found');
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        if (mounted) {
          setError('Failed to load categories');
        }
      } finally {
        if (mounted) {
          stopLoading(loadId);
        }
      }
    };

    fetchCategories();

    return () => {
      mounted = false;
      stopLoading(loadId); // Cleanup on unmount
    };
  }, []);

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
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
        <ul className="flex space-x-6 px-4">
          {categories.map((category, index) => (
            <li 
              key={category.id || `category-${index}`} 
              className="inline-block text-center flex-shrink-0"
            >
              <a 
                href={`https://rolexcart-ecomerce.web.app/product-list?category=${category.id}`}
                className="block"
              >
                <div className="relative w-12 h-12 mb-2">
                  <img 
                    className="w-full h-full object-cover rounded-full" 
                    src={category.image_url}
                    alt={category.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>
                <span className="text-sm text-blue-600 whitespace-normal text-center block">
                  {category.name}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryList;