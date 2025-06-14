import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.jsx'
import ListingPage from './Components/ListingPage/ListingPage.jsx'
import AllListings from './Components/Body/AllListings.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
