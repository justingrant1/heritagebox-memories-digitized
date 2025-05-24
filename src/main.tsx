
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
    s1.src = 'https://embed.tawk.to/68279c6acc21d9190ec452e3/1irdblvrq';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    document.body.appendChild(s1);
    
    // Adjust Tawk.to z-index after widget loads to prevent interference
    const adjustTawkZIndex = () => {
      const tawkWidget = document.querySelector('#tawkchat-chat-container');
      if (tawkWidget) {
        (tawkWidget as HTMLElement).style.zIndex = '999';
      }
      
      const tawkMinimized = document.querySelector('#tawkchat-minimized-container');
      if (tawkMinimized) {
        (tawkMinimized as HTMLElement).style.zIndex = '999';
      }
    };
    
    // Try to adjust z-index after a delay to ensure widget is loaded
    setTimeout(adjustTawkZIndex, 2000);
    
    // Also listen for Tawk API ready event if available
    const tawkAPI = (window as any).Tawk_API;
    if (tawkAPI) {
      tawkAPI.onLoad = adjustTawkZIndex;
    }
    
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
