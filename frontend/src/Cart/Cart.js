import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Cart = () => {
  const [cartData, setCartData] = useState(null);

  const getCSRFToken = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
    console.log('CSRF Token:', token ? token.split('=')[1] : 'Not found');
    return token ? token.split('=')[1] : '';
  };

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        await axios.get('http://127.0.0.1:8000/get-csrf-token/');

        const response = await axios.get('http://127.0.0.1:8000/cart/');
        setCartData(response.data);
      } catch (error) {
        console.error('Error fetching cart data:', error);
      }
    };

    fetchCartData();
  }, []);

  const updateCart = async (productId, quantity) => {
    console.log('Updating product:', productId, 'with quantity:', quantity); 
    try {
      const csrfToken = getCSRFToken();
      const response = await axios.post(
        `http://127.0.0.1:8000/update-cart/${productId}/`,
        { quantity: parseInt(quantity, 10) },
        {
          headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
  
      // Update the cart state with new quantity and prices
      setCartData((prevCartData) => {
        const updatedItems = prevCartData.cart_items.map((item) => {
          if (item.product.id === productId) {
            return {
              ...item,
              quantity: parseInt(quantity, 10),
              product: {
                ...item.product,
                discounted_price: response.data.discounted_price, // Update price from the response
              },
            };
          }
          return item;
        });
  
        return {
          ...prevCartData,
          cart_items: updatedItems,
          total_discounted_price: response.data.total_discounted_price, // Update total price
          total_discount: response.data.total_discount, // Update total discount
        };
      });
  
      console.log('Product updated in cart', response.data);
    } catch (error) {
      console.error('Error updating product in cart:', error); // Log the full error response
      if (error.response) {
        // The request was made and the server responded with a status code outside the range of 2xx
        console.log('Error Response:', error.response);
      } else if (error.request) {
        // The request was made but no response was received
        console.log('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error setting up request:', error.message);
      }
      alert('Error updating product in cart. Please try again.');
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      const csrfToken = getCSRFToken();
      const response = await axios.post(
        `http://127.0.0.1:8000/remove-from-cart/${productId}/`,
        {},
        {
          headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      console.log('Product removed from cart', response.data);

      setCartData(prevCartData => ({
        ...prevCartData,
        cart_items: prevCartData.cart_items.filter(item => item.product.id !== productId),
      }));
    } catch (error) {
      console.error('Error removing product from cart:', error);
    }
  };

  if (!cartData) return <div>Loading...</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 p-6 rounded-lg shadow-md mt-5">
        {cartData.cart_items.map((item, index) => (
          <div key={item.product.id} className="mb-6">
            <div className="flex items-start">
              <div className="flex flex-col items-center mr-6">
                <img
                  src={`http://localhost:8000${item.product.main_image.url}`}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover border border-gray-200 rounded mb-2"
                />
                <select
                  className="w-24 p-1 border border-gray-300 rounded"
                  value={item.quantity}
                  onChange={(e) => updateCart(item.product.id, e.target.value)}
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      Qty: {num}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <h2 className="text-lg font-bold mb-1">{item.product.name}</h2>
                <div className="flex items-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`fa ${
                        item.product.average_rating >= star
                          ? 'fa-star'
                          : item.product.average_rating >= star - 0.5
                          ? 'fa-star-half-alt'
                          : 'fa-star-o'
                      } text-sm ${
                        item.product.average_rating >= star - 0.5
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    ></i>
                  ))}
                  <span className="ml-1 text-sm text-gray-600">
                    ({item.product.number_of_reviews})
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-green-600 font-bold text-lg mr-2">
                {Number(item.product.discount_percentage).toFixed(0)}%
              </span>
              <span className="line-through text-gray-500 mr-2">
                ₹{Number(item.product.original_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              <span className="text-red-600 font-bold text-xl">
                ₹{Number(item.product.discounted_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <p className="text-sm mt-2">
              Delivery in 2 days, Tue ·{' '}
              <span className="text-green-600 font-bold">FREE</span>
            </p>
            <div className="flex justify-between mt-4">
              <button
                className="px-4 py-2 border border-gray-300 rounded text-center hover:bg-gray-100 transition"
                onClick={() => handleRemoveFromCart(item.product.id)}
              >
                Remove
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded text-center hover:bg-gray-100 transition">
                Buy now
              </button>
            </div>
            {index < cartData.cart_items.length - 1 && (
              <hr className="my-4 border-t border-gray-200" />
            )}
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto bg-white border border-gray-200 p-6 rounded-lg shadow-md mt-5">
        <h2 className="text-xl font-bold mb-4">Price Details</h2>
        <div className="flex justify-between mb-2">
          <span>Price ({cartData.cart_items.length} items)</span>
          <span>₹{Number(cartData.total_discounted_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Discount</span>
          <span className="text-green-600">₹{Number(cartData.total_discount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
          <span>Total Amount</span>
          <span>₹{Number(cartData.total_discounted_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
        </div>
        <p className="text-green-600 mt-2">
          You will save ₹{Number(cartData.total_discount).toLocaleString('en-IN', { maximumFractionDigits: 0 })} on this order
        </p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-between items-center">
        <div>
          <p className="text-gray-500 line-through text-sm">
            ₹{Number(cartData.total_original_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-green-600 font-bold">
            ₹{Number(cartData.total_discounted_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <button className="px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">Buy All</button>
      </div>
    </div>
  );
};

export default Cart;
