import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/inventory/summary');
      setSummary(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el resumen del inventario');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Dashboard del Sistema de Inventario</h1>
      
      {summary && (
        <>
          <div className="dashboard-cards">
            <div className="card">
              <h3>Total de Productos</h3>
              <p style={{ fontSize: '2em', margin: 0, color: '#3498db' }}>
                {summary.summary.total_productos}
              </p>
            </div>
            
            <div className="card">
              <h3>Total de Ubicaciones</h3>
              <p style={{ fontSize: '2em', margin: 0, color: '#27ae60' }}>
                {summary.summary.total_ubicaciones}
              </p>
            </div>
            
            <div className="card">
              <h3>Valor Total del Inventario</h3>
              <p style={{ fontSize: '2em', margin: 0, color: '#e74c3c' }}>
                ${summary.summary.valor_total.toFixed(2)}
              </p>
            </div>
            
            <div className="card">
              <h3>Productos con Stock Bajo</h3>
              <p style={{ fontSize: '2em', margin: 0, color: '#f39c12' }}>
                {summary.summary.productos_bajo_stock}
              </p>
            </div>
          </div>

          <div className="card">
            <h3>Top Productos</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {summary.top_productos.map(producto => (
                  <tr key={producto.id}>
                    <td>{producto.codigo}</td>
                    <td>{producto.nombre}</td>
                    <td>${producto.precio_unitario}</td>
                    <td>{producto.stock || producto.cantidad_total || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

