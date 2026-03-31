// Import StrictMode from React — a development-only wrapper that helps find potential problems.
// It renders components twice in development to catch side effects and deprecated API usage.
import { StrictMode } from 'react'

// Import createRoot — the modern React 18+ way to render the application into the DOM.
// This replaces the older ReactDOM.render() method.
import { createRoot } from 'react-dom/client'

// Import the global CSS styles (Tailwind directives and any custom CSS).
import './index.css'

// Import the root App component which contains all routes and pages.
import App from './App.jsx'

// Find the HTML element with id="root" in the index.html file and create a React root inside it.
// Then render the entire App component tree wrapped in StrictMode.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
