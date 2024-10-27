import React from 'react';
import { Helmet } from 'react-helmet';

const PasswordResetComplete = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <Helmet>
        <title>ResetDone | Rolexcart</title>
        <link 
          rel="icon" 
          href="https://res.cloudinary.com/dmohbdzs1/image/upload/v1730048690/fixed-removebg-preview_prw8l9.png" 
        />
      </Helmet>
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        <h2 className="text-2xl font-bold mb-6">Password Reset Complete</h2>
        <p className="mb-4">
          Your password has been set. You may go ahead and log in now.
        </p>
        <a
          href="/login"
          className="inline-block mt-6 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Log In
        </a>
      </div>
    </div>
  );
};

export default PasswordResetComplete;
