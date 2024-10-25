import React from 'react';

const ProductImage = ({ imageUrl, productName, className }) => {
  const isValidCloudinaryUrl = (url) => {
    if (!url) return false;
    try {
      // Ensure URL is a string and has basic Cloudinary URL structure
      return typeof url === 'string' && 
             url.includes('res.cloudinary.com') && 
             url.includes('/image/upload/') &&
             !url.endsWith('cloudinary') &&
             !url.endsWith('cloudinary.com');
    } catch (error) {
      console.error('Error validating Cloudinary URL:', error);
      return false;
    }
  };

  const getProcessedImageUrl = (url) => {
    if (!isValidCloudinaryUrl(url)) {
      console.warn('Invalid or missing image URL:', url);
      return '/placeholder-image.jpg';
    }

    try {
      // Clean up the URL by removing any unwanted characters
      const cleanUrl = url.trim().replace(/[\n\r]/g, '');
      
      // Add transformation parameters for optimization
      // Format: {base_url}/upload/q_auto,f_auto/{rest_of_url}
      const urlParts = cleanUrl.split('/upload/');
      if (urlParts.length === 2) {
        return `${urlParts[0]}/upload/q_auto,f_auto/${urlParts[1]}`;
      }
      
      return cleanUrl;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return '/placeholder-image.jpg';
    }
  };

  return (
    <img
      className={`${className} transition-opacity duration-300`}
      src={getProcessedImageUrl(imageUrl)}
      alt={productName || 'Product image'}
      onError={(e) => {
        console.log('Image load error, falling back to placeholder');
        e.target.onerror = null; // Prevent infinite error loop
        e.target.src = '/placeholder-image.jpg';
      }}
      loading="lazy"
    />
  );
};

export default ProductImage;