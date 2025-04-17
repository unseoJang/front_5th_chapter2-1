import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Ensure App is a default export and a valid React component

const rootElement = document.getElementById('app');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(React.createElement(App));
} else {
  console.error("Root element with id 'app' not found.");
}
