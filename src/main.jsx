// main.jsx
// Purpose: App entrypoint that mounts the React tree into the DOM.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// NOTE: We intentionally avoid <React.StrictMode> for this MVP demo.
// StrictMode double-invokes effects in development, which can create duplicate
// Daily (Vapi) call objects and trigger "Duplicate DailyIframe instances".
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
