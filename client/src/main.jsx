import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { PageTransitionProvider } from './context/PageTransitionContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PageTransitionProvider>
      <App />
    </PageTransitionProvider>
  </React.StrictMode>
);
