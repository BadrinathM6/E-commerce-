import React from 'react';
import { Helmet } from 'react-helmet';

const PasswordResetEmailSent = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <Helmet>
        <title>Password Reset Done | Rolexcart</title>
      </Helmet>
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        <h2 className="text-2xl font-bold mb-6">Password Reset Email Sent</h2>
        <p className="mb-4">
          We've emailed you instructions for setting your password. You should receive them shortly.
        </p>
        <p>
          If you don't receive an email, please make sure you've entered the address you registered with, and check your spam folder.
        </p>
        <a
          href="/"
          className="inline-block mt-6 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default PasswordResetEmailSent;
