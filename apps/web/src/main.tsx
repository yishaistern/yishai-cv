// Entry point: mount the React tree into <div id="root"> from index.html.
// Angular equivalent: bootstrapApplication(AppComponent).
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { ToastProvider } from './hooks/useToast.tsx';
import './app.css';

const root = document.getElementById('root');
if (!root) throw new Error('index.html is missing <div id="root">');

createRoot(root).render(
  // StrictMode (dev only) renders components and runs effects twice to surface
  // impure renders and missing effect cleanups. It does nothing in production.
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
);
