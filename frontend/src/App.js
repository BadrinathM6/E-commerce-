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
import PasswordResetDone from './Login&Register/PasswordResetDone';
import PasswordResetComplete from './Login&Register/ResetDone';
import EditProfile from './Login&Register/UserProfileUpdate';
import WishlistPage from './ProductDetail/WishListPage';
import { LoadingProvider } from './Home/LoadingContext';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center">
            <h2 className="text-xl text-red-600 mb-2">Something went wrong</h2>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <LoadingProvider>
          <Routes>
            <Route path='/' element={<Homepage/>}/>
            <Route path='/product-list' element={<ProductList/>}/>
            <Route path='/product/:productId' element={<ProductPage/>}/>
            <Route path='/cart' element={<Cart/>}/>
            <Route path='/checkout' element={<CheckoutPage/>}/>
            <Route path='/orders' element={<OrderList/>}/>
            <Route path='/orders/:orderId' element={<OrderPage/>}/>
            <Route path='/register' element={<Register/>}/>
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
        </LoadingProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;