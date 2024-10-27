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
    const fetchData = async () => {
      startLoading('homepage');
      try {
        const response = await axiosInstance.get('');
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        stopLoading('homepage');
      }
    };

    fetchData();
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