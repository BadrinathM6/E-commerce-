import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './Home/Homepage';
import ProductList from './ProductList/ProductList';
import ProductPage from './ProductDetail/ProductPage';

const App = () =>{
  return(
    <Router>
      <Routes>
        <Route path='/' element={<Homepage/>}/>
        <Route path='/product-list' element={<ProductList/>}/>
        <Route path='/product/:productId' element={<ProductPage/>}/>
      </Routes>
    </Router>
  )
}

export default App