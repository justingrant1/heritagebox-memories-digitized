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
    
    // Adjust Tawk.to positioning to prevent interference while keeping it visible
    const adjustTawkWidget = () => {
      // Add a style to ensure proper layering without blocking interactions
      const style = document.createElement('style');
      style.textContent = `
        #tawkchat-container-minimized,
        #tawkchat-minimized-container {
          z-index: 9999 !important;
          pointer-events: auto !important;
        }
        #tawkchat-container {
          z-index: 9999 !important;
          pointer-events: auto !important;
        }
        /* Ensure the widget iframe has proper pointer events */
        iframe[src*="tawk.to"] {
          pointer-events: auto !important;
        }
        /* Ensure page content remains interactive but doesn't override widget */
        body {
          pointer-events: auto !important;
        }
      `;
      document.head.appendChild(style);
    };
    
    // Apply adjustments after widget loads
    setTimeout(adjustTawkWidget, 1000);
    setTimeout(adjustTawkWidget, 3000);
    
    // Also listen for Tawk API ready event if available
    const checkTawkAPI = () => {
      const tawkAPI = (window as any).Tawk_API;
      if (tawkAPI) {
        tawkAPI.onLoad = adjustTawkWidget;
      } else {
        // Retry checking for Tawk API
        setTimeout(checkTawkAPI, 500);
      }
    };
    
    checkTawkAPI();
    
    // Clean up function to remove script when component unmounts
    return () => {
      if (document.body.contains(s1)) {
        document.body.removeChild(s1);
      }
    };
  }, []);

  return null; // This component doesn't render anything visible
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
      <TawkToChat />
    </HelmetProvider>
  </React.StrictMode>
);
