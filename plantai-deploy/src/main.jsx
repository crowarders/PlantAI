import React from 'react';
import ReactDOM from 'react-dom/client';
import PlantAI from './PlantAI.jsx';
import AdminPanel from './AdminPanel.jsx';

const isAdmin = new URLSearchParams(window.location.search).get('admin') === '1';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isAdmin ? <AdminPanel /> : <PlantAI />}
  </React.StrictMode>
);
