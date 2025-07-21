
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';
import { ChatProvider } from './contexts/ChatContext.tsx';

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ChatProvider>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </ChatProvider>
    </React.StrictMode>
  );
}
