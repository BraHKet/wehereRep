// -----------------------------------------------------------------
// index.js - Punto di ingresso dell'applicazione
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// -----------------------------------------------------------------
// Struttura consigliata delle cartelle del progetto:
/*
project-root/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── ...
├── src/
│   ├── assets/         // Immagini, icone, etc.
│   ├── components/     // Componenti React
│   │   ├── HomePage.js
│   │   ├── Dashboard.js
│   │   ├── CreateParty.js
│   │   ├── ...
│   │   └── common/     // Componenti riutilizzabili
│   │       ├── Button.js
│   │       ├── Card.js
│   │       └── ...
│   ├── contexts/       // React Context API
│   │   └── AuthContext.js
│   ├── hooks/          // Custom hooks
│   │   └── useAuth.js
│   ├── services/       // API e servizi
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── ...
│   ├── styles/         // Stili CSS
│   │   ├── global.css
│   │   └── ...
│   ├── utils/          // Funzioni di utilità
│   │   └── helpers.js
│   ├── App.js
│   └── index.js
├── package.json
└── ...
*/