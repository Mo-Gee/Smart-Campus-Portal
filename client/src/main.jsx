/**
 * Entry point for the React application
 * Sets up the root rendering with React Router and StrictMode
 */

import React from 'react'  // React's StrictMode for highlighting potential problems
import ReactDOM from 'react-dom/client' // Modern React 18 rendering API
import './index.css'
import App from './App.jsx' // Import the main App component
import { BrowserRouter } from 'react-router-dom' // Router for handling client-side navigation

// Create a root and render the application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* BrowserRouter enables client-side routing using HTML5 history API */}
      <App />
      {/* Main application component */}
    </BrowserRouter>
  </React.StrictMode>,
)
