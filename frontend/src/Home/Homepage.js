import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import CategoryList from './CategoryList';
import DealProducts from './DealProducts';
import Timer from './Timer';
import TrendingProducts from './TrendingProducts';

const Homepage = () =>{
    const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/")
      .then(response => {
        console.log(response.data); // Check data in the console
        setData(response.data); // Save the data into state
      })
      .catch(error => {
        console.error("Error fetching data", error);
      });
  }, []);
      
    if (!data) {
      return <div>Loading...</div>; // Display a loading state if no data yet
    }
    
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