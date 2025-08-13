import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: '200px', background: '#f0f0f0', padding: '20px' }}>
        <nav>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/inventory">Inventory</Link></li>
            <li><Link to="/transactions">Transactions</Link></li>
            <li><Link to="/locations">Locations</Link></li>
            <li><Link to="/blockchain">Blockchain</Link></li>
            <li><Link to="/users">Users</Link></li>
            <li><Link to="/settings">Settings</Link></li>
          </ul>
        </nav>
      </aside>
      <main style={{ flexGrow: 1, padding: '20px' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;


