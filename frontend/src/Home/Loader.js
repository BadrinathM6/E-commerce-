import React from 'react';

const LoadingAnimation = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-64 h-64">
        <iframe 
          src="https://lottie.host/embed/7fb743b5-2537-4e9e-8e6c-9abc631d526b/p2EGQxKeCN.json"
          className="w-full h-full border-none"
          title="Loading animation"
        />
      </div>
    </div>
  );
};

export default LoadingAnimation;