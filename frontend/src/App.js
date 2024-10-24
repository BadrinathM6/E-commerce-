import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './Home/Homepage';
import ProductList from './ProductList/ProductList';
import ProductPage from './ProductDetail/ProductPage';
import Cart from './Cart/Cart';
import Register from './Login&Register/Register';
import Login from './Login&Register/Login';
import CheckoutPage from './Checkout/Checkout';
import OrderPage from './Order/Order';
import OrderList from './Order/OrderList';
import UserProfile from './Login&Register/userProfile';
import PasswordResetForm from './Login&Register/Password_reset';
import PasswordResetConfirm from './Login&Register/PasswordConfirmation';
import PasswordResetDone from './Login&Register/PasswordResetDone'
import PasswordResetComplete from './Login&Register/ResetDone';
import EditProfile from './Login&Register/UserProfileUpdate';
import WishlistPage from './ProductDetail/WishListPage';
import PaymentComponent from './Checkout/RazorPayment';

const App = () =>{
  return(
    <Router>
      <Routes>
        <Route path='/' element={<Homepage/>}/>
        <Route path='/product-list' element={<ProductList/>}/>
        <Route path='/product/:productId' element={<ProductPage/>}/>
        <Route path='/cart' element={<Cart/>}/>
        <Route path='/checkout' element={<CheckoutPage/>}/>
        <Route path='/orders' element={<OrderList/>}/>
        <Route path='/orders/:orderId' element={<OrderPage/>}/>
        <Route path='/register' element= {<Register/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/user-profile' element={<UserProfile/>}/>
        <Route path="/password-reset" element={<PasswordResetForm />} />
        <Route path="/reset/:uidb64/:token" element={<PasswordResetConfirm />} />
        <Route path='/password-reset-complete' element={<PasswordResetDone/>}/>
        <Route path='/reset/done' element={<PasswordResetComplete/>} />
        <Route path='/user-profile-update' element={<EditProfile/>}/>
        <Route path='/wishlist' element={<WishlistPage/>}/>
        {/* <Route path='/Razorpay' element={<PaymentComponent/>}/> */}
      </Routes>
    </Router>
  )
}

export default App