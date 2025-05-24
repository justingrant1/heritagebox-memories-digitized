
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
    
    // Adjust Tawk.to z-index and positioning to prevent interference
    const adjustTawkWidget = () => {
      const tawkWidget = document.querySelector('#tawkchat-chat-container');
      if (tawkWidget) {
        (tawkWidget as HTMLElement).style.zIndex = '998';
        (tawkWidget as HTMLElement).style.pointerEvents = 'auto';
      }
      
      const tawkMinimized = document.querySelector('#tawkchat-minimized-container');
      if (tawkMinimized) {
        (tawkMinimized as HTMLElement).style.zIndex = '998';
        (tawkMinimized as HTMLElement).style.pointerEvents = 'auto';
        // Ensure the minimized widget doesn't block other elements
        (tawkMinimized as HTMLElement).style.position = 'fixed';
        (tawkMinimized as HTMLElement).style.bottom = '20px';
        (tawkMinimized as HTMLElement).style.right = '20px';
      }

      // Ensure the widget iframe doesn't interfere with page interactions
      const tawkIframes = document.querySelectorAll('iframe[src*="tawk.to"]');
      tawkIframes.forEach((iframe) => {
        (iframe as HTMLElement).style.pointerEvents = 'auto';
        (iframe as HTMLElement).style.zIndex = '998';
      });

      // Add a style to prevent widget from interfering with page content
      const style = document.createElement('style');
      style.textContent = `
        #tawkchat-container-minimized {
          pointer-events: auto !important;
          z-index: 998 !important;
        }
        #tawkchat-container {
          pointer-events: auto !important;
          z-index: 998 !important;
        }
        /* Ensure page content remains interactive */
        body > *:not([id*="tawk"]) {
          pointer-events: auto !important;
        }
      `;
      document.head.appendChild(style);
    };
    
    // Try to adjust positioning multiple times to ensure it works
    setTimeout(adjustTawkWidget, 1000);
    setTimeout(adjustTawkWidget, 3000);
    setTimeout(adjustTawkWidget, 5000);
    
    // Also listen for Tawk API ready event if available
    const checkTawkAPI = () => {
      const tawkAPI = (window as any).Tawk_API;
      if (tawkAPI) {
        tawkAPI.onLoad = adjustTawkWidget;
        tawkAPI.onChatMinimized = adjustTawkWidget;
        tawkAPI.onChatMaximized = adjustTawkWidget;
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
