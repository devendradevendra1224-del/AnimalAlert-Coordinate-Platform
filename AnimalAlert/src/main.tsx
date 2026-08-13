import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { registerServiceWorker, initPwaInstallListener } from './services/pwaService';

// Initialize PWA Service Worker & Installation Listener
registerServiceWorker();
initPwaInstallListener();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

