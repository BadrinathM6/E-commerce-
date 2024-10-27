import React, { useEffect, useState } from 'react';
import { useLoading } from './LoadingContext';
import Navbar from './Navbar';
import CategoryList from './CategoryList';
import DealProducts from './DealProducts';
import Timer from './Timer';
import TrendingProducts from './TrendingProducts';
import axiosInstance from '../utils/axiosConfig';

const Homepage = () => {
  const [data, setData] = useState(null);
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    let mounted = true;
    const loadId = 'homepage-' + Date.now();

    const fetchData = async () => {
      try {
        startLoading(loadId);
        const response = await axiosInstance.get('');
        
        if (mounted) {
          setData(response.data);
          setError(null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (mounted) {
          setError('Failed to load data');
        }
      } finally {
        if (mounted) {
          stopLoading(loadId);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      mounted = false;
      stopLoading(loadId); // Ensure loading is stopped if component unmounts
    };
  }, []);
    
    return (
          <div>
              <Navbar />
              <CategoryList />
              <DealProducts />
              <Timer />
              <TrendingProducts />
          </div>
      );
};

export default Homepage