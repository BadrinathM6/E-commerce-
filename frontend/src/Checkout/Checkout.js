import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import axiosInstance from '../utils/axiosConfig'

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: ''
  });

  const navigate = useNavigate();
  const location = useLocation();
  const isBuyNow = location.state?.buyNow;
  const buyNowProduct = location.state?.product;

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.product.discounted_price * item.quantity), 0);
  };

  // Helper function to format address for dropdown
  const formatAddressForDropdown = (address) => {
    const addressLine = address.address_line1.split(',')[0]; // Get just the first part of address
    return `${addressLine}, ${address.city}`; // Short format for dropdown
  };

  // Helper function to remove duplicate addresses
  const removeDuplicateAddresses = (addresses) => {
    const seen = new Set();
    return addresses.filter(address => {
      const key = `${address.address_line1}-${address.city}-${address.state}-${address.zip_code}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  useEffect(() => {
    if (isBuyNow && buyNowProduct) {
      const buyNowItems = [{
        product: {
          ...buyNowProduct,
          discounted_price: parseFloat(buyNowProduct.discounted_price)
        },
        quantity: buyNowProduct.quantity
      }];
      setCartItems(buyNowItems);
      setTotal(calculateTotal(buyNowItems));
      setLoading(false);
    } else {
      fetchCartItems();
    }
    fetchSavedAddresses();
  }, [isBuyNow, buyNowProduct]);

  const fetchCartItems = async () => {
    try {
      const response = await axiosInstance.get('/cart/');
      setCartItems(response.data.cart_items);
      setTotal(response.data.total_discounted_price);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch cart items. Please try again.');
      setLoading(false);
    }
  };

  const fetchSavedAddresses = async () => {
    try {
      const response = await axiosInstance.get('/saved-addresses/');
      // Remove duplicate addresses before setting state
      const uniqueAddresses = removeDuplicateAddresses(response.data);
      setSavedAddresses(uniqueAddresses);
      if (uniqueAddresses.length > 0) {
        setSelectedAddressId(uniqueAddresses[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch saved addresses:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAddressSelection = (e) => {
    const addressId = parseInt(e.target.value);
    if (addressId === -1) {
      setShowNewAddressForm(true);
      setSelectedAddressId(null);
    } else {
      setShowNewAddressForm(false);
      setSelectedAddressId(addressId);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    try {
      let addressToUse = selectedAddressId 
        ? savedAddresses.find(addr => addr.id === selectedAddressId) 
        : shippingAddress;

      const addressData = {
        shipping_address: {
          full_name: addressToUse.full_name,
          address_line1: addressToUse.address_line1,
          address_line2: addressToUse.address_line2 || '',
          zip_code: addressToUse.zip_code,
          city: addressToUse.city,
          state: addressToUse.state,
          country: addressToUse.country,
          use_saved_address: !!selectedAddressId,
        }
      };

      let response;
      if (isBuyNow) {
        response = await axiosInstance.post('/buy-now-checkout/', {
          ...addressData,
          product_id: buyNowProduct.id,
          quantity: buyNowProduct.quantity
        });
      } else {
        response = await axiosInstance.post('/checkout/', addressData);
      }

      if (response.data.message === "Order placed successfully!") {
        const orderId = response.data.order.id;
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Your order has been placed',
          confirmButtonText: 'OK'
        });
        navigate(`/orders/${orderId}`);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to place order. Please try again.');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
          {cartItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center mb-2">
              <span>{item.product.name} x {item.quantity}</span>
              <span>₹{Number(item.product.discounted_price * item.quantity).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          ))}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center font-bold">
              <span>Total:</span>
              <span>₹{Number(total).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Shipping Address</h2>
          <form onSubmit={handleCheckout}>
            {savedAddresses.length > 0 && (
              <div className="mb-4">
                <label htmlFor="savedAddress" className="block mb-2">Select an address:</label>
                <select
                  id="savedAddress"
                  onChange={handleAddressSelection}
                  value={selectedAddressId || -1}
                  className="w-full px-3 py-2 border rounded"
                >
                  {savedAddresses.map(address => (
                    <option key={address.id} value={address.id}>
                      {formatAddressForDropdown(address)}
                    </option>
                  ))}
                  <option value={-1}>Add a new address</option>
                </select>
              </div>
            )}

            {(showNewAddressForm || savedAddresses.length === 0) && (
              <>
                <div className="mb-4">
                  <label htmlFor="fullName" className="block mb-2">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="full_name"
                    value={shippingAddress.full_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="addressLine1" className="block mb-2">Address Line 1</label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="address_line1"
                    value={shippingAddress.address_line1}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="addressLine2" className="block mb-2">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="address_line2"
                    value={shippingAddress.address_line2}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="city" className="block mb-2">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="state" className="block mb-2">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="zipCode" className="block mb-2">ZIP Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zip_code"
                    value={shippingAddress.zip_code}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="country" className="block mb-2">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </>
            )}
            
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
              <div className="flex items-center mb-4">
                <input type="radio" name="payment" value="cod" checked readOnly className="mr-2" />
                <span>Cash on Delivery</span>
              </div>
            </div>
            
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold mt-8 hover:bg-blue-700 w-full"
            >
              Place Order
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};;

export default CheckoutPage;