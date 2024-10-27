import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const LoadingContext = createContext();

// Separate component for the Lottie animation
const LoadingAnimation = () => {
  return (
    <div className="w-64 h-64">
      <iframe 
        src="https://lottie.host/embed/7fb743b5-2537-4e9e-8e6c-9abc631d526b/p2EGQxKeCN.json"
        className="w-full h-full border-none"
        title="Loading animation"
      />
    </div>
  );
};

export const LoadingProvider = ({ children }) => {
  const [loadingComponents, setLoadingComponents] = useState(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  // Reset loading state on route change
  useEffect(() => {
    setLoadingComponents(new Set());
    setIsVisible(false);
  }, [location]);

  // Debounce the loader visibility to prevent flashing
  useEffect(() => {
    const hasLoading = loadingComponents.size > 0;
    let timeoutId;

    if (hasLoading) {
      timeoutId = setTimeout(() => {
        setIsVisible(true);
      }, 150); // Small delay to prevent loader flash on quick loads
    } else {
      setIsVisible(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loadingComponents]);

  const startLoading = (componentId) => {
    try {
      setLoadingComponents(prev => {
        const newSet = new Set(prev);
        newSet.add(componentId);
        return newSet;
      });
    } catch (error) {
      console.error('Error starting loading:', error);
    }
  };

  const stopLoading = (componentId) => {
    try {
      setLoadingComponents(prev => {
        const newSet = new Set(prev);
        newSet.delete(componentId);
        return newSet;
      });
    } catch (error) {
      console.error('Error stopping loading:', error);
      // Force reset loading state in case of error
      setLoadingComponents(new Set());
      setIsVisible(false);
    }
  };

  return (
    <LoadingContext.Provider 
      value={{ 
        startLoading, 
        stopLoading, 
        isLoading: loadingComponents.size > 0 
      }}
    >
      {children}
      {isVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] transition-opacity duration-300 ease-in-out"
          style={{ 
            opacity: isVisible ? 1 : 0,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div className="bg-white rounded-lg p-4 shadow-lg transform transition-transform duration-300 ease-in-out scale-100">
            <LoadingAnimation />
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

// Custom hook with error handling
export const useLoading = () => {
  const context = useContext(LoadingContext);
  
  if (!context) {
    console.error('useLoading must be used within a LoadingProvider');
    // Return dummy functions to prevent crashes
    return {
      startLoading: () => {},
      stopLoading: () => {},
      isLoading: false
    };
  }
  
  return context;
};

export default LoadingProvider;