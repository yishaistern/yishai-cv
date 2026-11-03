// Entry point: mount the React tree into <div id="root"> from index.html.
// Angular equivalent: bootstrapApplication(AppComponent).
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ToastProvider } from './hooks/useToast.tsx';
import './app.css';

createRoot(document.getElementById('root')!).render(
  // StrictMode (dev only) renders components and runs effects twice to surface
  // impure renders and missing effect cleanups. It does nothing in production.
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
