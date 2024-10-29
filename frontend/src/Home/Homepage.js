import React, { useEffect, useState } from 'react';
import { useLoading } from './LoadingContext';
import { Helmet } from 'react-helmet';
import Navbar from './Navbar';
import CategoryList from './CategoryList';
import DealProducts from './DealProducts';
import Timer from './Timer';
import TrendingProducts from './TrendingProducts';
import axiosInstance from '../utils/axiosConfig';
import LoadingAnimation from './Loader';

const Homepage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    let mounted = true;
    const loadId = 'homepage-' + Date.now();

    const fetchData = async () => {
      try {
        startLoading(loadId);
        setLoading(true)
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
          setLoading(false)
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

  if (loading) {
    return (
        <>
            <Navbar />
            <LoadingAnimation />
        </>
    );
  }
    
    return (
          <div>
            <Helmet>
              <title>Home - RolexCart</title>
              <link rel="icon" type="image/png" sizes="32x32" href="https://res.cloudinary.com/dmohbdzs1/image/upload/v1730216073/favicon-32x32_pkyjnn.png" />
              <link rel="icon" type="image/png" sizes="16x16" href="https://res.cloudinary.com/dmohbdzs1/image/upload/v1730216072/favicon-16x16_wjvbeg.png" />
              <link rel="apple-touch-icon" sizes="180x180" href="https://res.cloudinary.com/dmohbdzs1/image/upload/v1730216072/apple-touch-icon_ro6fth.png" />
              <link rel="icon" type="image/x-icon" href="https://res.cloudinary.com/dmohbdzs1/image/upload/v1730216073/favicon_v00s9z.ico" /> 
              <meta name="description" content="Welcome to RolexCart! Find the best deals and trending products here." />
            </Helmet>
            
            <Navbar />
            <CategoryList />
            <DealProducts />
            <Timer />
            <TrendingProducts />
          </div>
      );
};

export default Homepage