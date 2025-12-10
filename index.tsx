import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log('[DEBUG] index.tsx loaded');

const showError = (message: string, error?: unknown) => {
  console.error('[ERROR]', message, error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; font-family: monospace; background: #fee; color: #c00; border: 2px solid #c00; margin: 20px; border-radius: 8px;">
        <h2 style="margin: 0 0 10px;">Erreur de chargement</h2>
        <p><strong>${message}</strong></p>
        <pre style="background: #fff; padding: 10px; overflow: auto; max-height: 300px;">${error instanceof Error ? error.stack || error.message : String(error || '')}</pre>
        <p style="margin-top: 10px; font-size: 12px;">Ouvrez la console (F12) pour plus de détails.</p>
      </div>
    `;
  }
};

window.onerror = (msg, url, line, col, error) => {
  showError(`Global error: ${msg} at ${url}:${line}:${col}`, error);
  return false;
};

window.onunhandledrejection = (event) => {
  showError('Unhandled Promise rejection', event.reason);
};

try {
  console.log('[DEBUG] Looking for root element...');
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    showError('Could not find root element to mount to');
    throw new Error("Could not find root element to mount to");
  }
  
  console.log('[DEBUG] Root element found, creating React root...');
  const root = createRoot(rootElement);
  
  console.log('[DEBUG] Rendering App component...');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('[DEBUG] App rendered successfully');
} catch (error) {
  showError('Failed to initialize React app', error);
}
