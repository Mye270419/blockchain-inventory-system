import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Inventory from './components/Inventory';
import Transactions from './components/Transactions';
import Locations from './components/Locations';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Layout>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;

