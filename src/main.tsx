
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
