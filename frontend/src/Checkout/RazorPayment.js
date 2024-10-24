// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axiosInstance from '../utils/axiosConfig';

// const PaymentComponent = ({ orderId, amount, onPaymentSuccess }) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [successMessage, setSuccessMessage] = useState('');
//   const navigate = useNavigate();

//   const initializeRazorpay = () => {
//     return new Promise((resolve) => {
//       const script = document.createElement('script');
//       script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//       document.body.appendChild(script);
//     });
//   };

//   const handlePayment = async () => {
//     setLoading(true);
//     setError(null);
//     setSuccessMessage('');

//     const isRazorpayLoaded = await initializeRazorpay();
//     if (!isRazorpayLoaded) {
//         setError('Failed to load Razorpay. Please try again later.');
//         setLoading(false);
//         return;
//     }


//     try {
//       const { data } = await axiosInstance.post('/create-payment/', {
//         order_id: orderId
//       });

//       const options = {
//         key: data.key,
//         amount: data.amount,
//         currency: data.currency,
//         name: 'Your Shop Name',
//         description: 'Order Payment',
//         order_id: data.order_id,
//         handler: async (response) => {
//           try {
//             const verificationData = await axiosInstance.post('/verify-payment/', {
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_signature: response.razorpay_signature
//             });

//             if (verificationData.data.success) {
//               setSuccessMessage('Payment successful! Redirecting...');
//               onPaymentSuccess();
//               setTimeout(() => {
//                 navigate(`/orders/${orderId}`);
//               }, 2000);
//             }
//           } catch (err) {
//             setError('Payment verification failed. Please contact support.');
//           }
//         },
//         prefill: {
//           name: 'Customer Name',
//           email: 'customer@example.com',
//           contact: '9999999999'
//         },
//         theme: {
//           color: '#3399cc'
//         }
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err) {
//       setError(err.response?.data?.error || 'Payment initialization failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="w-full max-w-md mx-auto p-6">
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           <p className="font-bold">Error</p>
//           <p>{error}</p>
//         </div>
//       )}

//       {successMessage && (
//         <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
//           <p className="font-bold">Success</p>
//           <p>{successMessage}</p>
//         </div>
//       )}

//       <div className="bg-white rounded-lg shadow-md p-6 mb-4">
//         <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
//         <div className="flex justify-between mb-2">
//           <span>Order ID:</span>
//           <span>{orderId}</span>
//         </div>
//         <div className="flex justify-between mb-4">
//           <span>Amount:</span>
//           <span>₹{amount}</span>
//         </div>
//         <button
//           onClick={handlePayment}
//           disabled={loading}
//           className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
//         >
//           {loading ? 'Processing...' : 'Pay Now'}
//         </button>
//       </div>

//       <div className="text-sm text-gray-600">
//         <p className="mb-2">Secure payment powered by Razorpay</p>
//         <p>* All transactions are processed on a secure payment network</p>
//       </div>
//     </div>
//   );
// };

// export default PaymentComponent;