import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Inventory from './components/Inventory';
import Transactions from './components/Transactions';
import Locations from './components/Locations';
import Blockchain from './components/Blockchain';
import Users from './components/Users';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route
            path="/*"
            element={
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/locations" element={<Locations />} />
                    <Route path="/blockchain" element={<Blockchain />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </Layout>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;


