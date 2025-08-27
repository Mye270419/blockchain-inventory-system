import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Inventory = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInventorySummary();
  }, []);

  const fetchInventorySummary = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/inventory/summary');
      setSummary(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el inventario');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando inventario...</div>;

  return (
    <div>
      <h1>Estado del Inventario</h1>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

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
              <h3>Valor Total</h3>
              <p style={{ fontSize: '2em', margin: 0, color: '#e74c3c' }}>
                ${summary.summary.valor_total.toFixed(2)}
              </p>
            </div>
            
            <div className="card">
              <h3>Alertas de Stock</h3>
              <p style={{ fontSize: '2em', margin: 0, color: '#f39c12' }}>
                {summary.summary.productos_bajo_stock}
              </p>
            </div>
          </div>

          {summary.top_productos && summary.top_productos.length > 0 && (
            <div className="card">
              <h3>Productos en Inventario</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Stock Total</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.top_productos.map(producto => (
                    <tr key={producto.id}>
                      <td>{producto.id}</td>
                      <td>{producto.codigo}</td>
                      <td>{producto.nombre}</td>
                      <td>{producto.stock || producto.cantidad_total || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {summary.summary.alertas_stock && summary.summary.alertas_stock.length > 0 && (
            <div className="card">
              <h3>Alertas de Stock Bajo</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Stock Actual</th>
                    <th>Stock Mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.summary.alertas_stock.map(alerta => (
                    <tr key={alerta.id} style={{ backgroundColor: '#ffebee' }}>
                      <td>{alerta.codigo}</td>
                      <td>{alerta.nombre}</td>
                      <td>{alerta.stock_actual}</td>
                      <td>{alerta.stock_minimo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Inventory;

