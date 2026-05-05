import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
        <Toaster  
        position="top-right"        
        toastOptions={{
          duration: 4000,            
          style: {
            background: '#1f2937',   
            color: '#f3f4f6',        
            border: '1px solid #374151',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            style: {
              borderLeft: '4px solid #3b82f6',  
            },
          },
          error: {
            style: {
              borderLeft: '4px solid #ef4444',  
            },
          },
        }}
      />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)