import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <>
      <aside className="sidebar">
        <h2>Sistema de Inventario</h2>
        <nav>
          <ul>
            <li><Link to="/dashboard">📊 Dashboard</Link></li>
            <li><Link to="/products">📦 Productos</Link></li>
            <li><Link to="/inventory">📋 Inventario</Link></li>
            <li><Link to="/transactions">💱 Transacciones</Link></li>
            <li><Link to="/locations">📍 Ubicaciones</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </>
  );
};

export default Layout;

