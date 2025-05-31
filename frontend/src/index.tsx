import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import App from './App';
import './styles/index.css';

// Initialize any analytics or monitoring here if needed
const initializeApp = () => {
  // You can add startup logic here if needed
  console.log('Application initialized');
};

// Call initialization function
initializeApp();

// Create root and render app
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <App />
        </Router>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

// If you want to add service worker registration for PWA support
// serviceWorkerRegistration.register();

// If you want to start measuring performance
// reportWebVitals(console.log);