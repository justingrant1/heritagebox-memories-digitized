
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Tawk.to chat widget component
const TawkToChat = () => {
  useEffect(() => {
    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = 'https://embed.tawk.to/68279c6cc21d9190ec452e3/1irdblvrq';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    document.body.appendChild(s1);
    
    // Ensure Tawk.to widget is visible and properly positioned
    const adjustTawkWidget = () => {
      const style = document.createElement('style');
      style.id = 'tawk-custom-styles';
      style.textContent = `
        /* Ensure Tawk.to widget is visible and accessible */
        #tawkchat-container-minimized,
        #tawkchat-minimized-container,
        #tawkchat-container {
          z-index: 10000 !important;
          pointer-events: auto !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        /* Ensure the widget iframe is visible */
        iframe[src*="tawk.to"] {
          pointer-events: auto !important;
          z-index: 10000 !important;
          display: block !important;
          visibility: visible !important;
        }
        
        /* Prevent page elements from overlapping the widget */
        body {
          pointer-events: auto !important;
        }
        
        /* Ensure buttons and other elements don't block the widget */
        button, a {
          z-index: auto;
        }
      `;
      
      // Remove existing style if it exists
      const existingStyle = document.getElementById('tawk-custom-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      document.head.appendChild(style);
      
      console.log('Tawk.to widget styles applied');
    };
    
    // Apply adjustments multiple times to ensure they stick
    setTimeout(adjustTawkWidget, 500);
    setTimeout(adjustTawkWidget, 2000);
    setTimeout(adjustTawkWidget, 5000);
    
    // Listen for Tawk API ready event
    const checkTawkAPI = () => {
      const tawkAPI = (window as any).Tawk_API;
      if (tawkAPI) {
        console.log('Tawk API loaded');
        tawkAPI.onLoad = () => {
          console.log('Tawk widget loaded');
          adjustTawkWidget();
        };
      } else {
        setTimeout(checkTawkAPI, 500);
      }
    };
    
    checkTawkAPI();
    
    // Clean up function
    return () => {
      if (document.body.contains(s1)) {
        document.body.removeChild(s1);
      }
      const customStyles = document.getElementById('tawk-custom-styles');
      if (customStyles) {
        customStyles.remove();
      }
    };
  }, []);

  return null;
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
      <TawkToChat />
    </HelmetProvider>
  </React.StrictMode>
);
