// LoadingContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const LoadingContext = createContext();

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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] transition-opacity duration-200"
          style={{ opacity: isVisible ? 1 : 0 }}
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
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