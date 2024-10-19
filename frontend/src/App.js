import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './Home/Homepage';
import ProductList from './ProductList/ProductList';
import ProductPage from './ProductDetail/ProductPage';
import Cart from './Cart/Cart';
import Register from './Login&Register/Register';
import Login from './Login&Register/Login';

const App = () =>{
  return(
    <Router>
      <Routes>
        <Route path='/' element={<Homepage/>}/>
        <Route path='/product-list' element={<ProductList/>}/>
        <Route path='/product/:productId' element={<ProductPage/>}/>
        <Route path='/cart' element={<Cart/>}/>
        <Route path='/register' element= {<Register/>}/>
        <Route path='/login' element={<Login/>}/>
      </Routes>
    </Router>
  )
}

export default App