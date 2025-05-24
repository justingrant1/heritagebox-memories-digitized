
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Simplified Tawk.to chat widget component
const TawkToChat = () => {
  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[src*="tawk.to"]')) {
      console.log('Tawk.to script already exists');
      return;
    }

    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = 'https://embed.tawk.to/68279c6cc21d9190ec452e3/1irdblvrq';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    
    // Add onload handler to confirm script loaded
    s1.onload = () => {
      console.log('Tawk.to script loaded successfully');
    };
    
    s1.onerror = () => {
      console.error('Failed to load Tawk.to script');
    };
    
    document.body.appendChild(s1);
    
    // Simple check for Tawk API without complex styling
    const checkTawkAPI = () => {
      const tawkAPI = (window as any).Tawk_API;
      if (tawkAPI) {
        console.log('Tawk API is available');
        // Set basic widget properties
        tawkAPI.onLoad = () => {
          console.log('Tawk widget fully loaded');
        };
      } else {
        setTimeout(checkTawkAPI, 1000);
      }
    };
    
    setTimeout(checkTawkAPI, 2000);
    
    // Clean up function
    return () => {
      const existingScript = document.querySelector('script[src*="tawk.to"]');
      if (existingScript && document.body.contains(existingScript)) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return null;
};

// Check if root already exists to prevent the warning
const rootElement = document.getElementById("root");
let root;

if (rootElement && !rootElement._reactRootContainer) {
  root = createRoot(rootElement);
} else if (rootElement) {
  // If root already exists, just render to it
  root = (rootElement as any)._reactInternalInstance?.fiberNode?.stateNode?.containerInfo?._reactRootContainer || createRoot(rootElement);
}

if (root) {
  root.render(
    <React.StrictMode>
      <HelmetProvider>
        <App />
        <TawkToChat />
      </HelmetProvider>
    </React.StrictMode>
  );
}
