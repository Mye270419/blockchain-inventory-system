import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    producto_id: '',
    tipo: 'Entrada',
    cantidad: ''
  });

  useEffect(() => {
    fetchTransactions();
    fetchProducts();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/transactions');
      setTransactions(response.data.transactions);
      setError(null);
    } catch (err) {
      setError('Error al cargar las transacciones');
      console.error('Error:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data.products);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los productos');
      console.error('Error:', err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/transactions', {
        ...newTransaction,
        producto_id: parseInt(newTransaction.producto_id),
        cantidad: parseInt(newTransaction.cantidad)
      });
      
      setNewTransaction({ producto_id: '', tipo: 'Entrada', cantidad: '' });
      setShowForm(false);
      fetchTransactions();
    } catch (err) {
      setError('Error al crear la transacción');
      console.error('Error:', err);
    }
  };

  const handleInputChange = (e) => {
    setNewTransaction({
      ...newTransaction,
      [e.target.name]: e.target.value
    });
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.nombre : 'Producto no encontrado';
  };

  if (loading) return <div>Cargando transacciones...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Gestión de Transacciones</h1>
        <button 
          className="btn btn-success" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : 'Nueva Transacción'}
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Crear Nueva Transacción</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Producto:</label>
              <select
                name="producto_id"
                value={newTransaction.producto_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccionar producto</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.codigo} - {product.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Tipo:</label>
              <select
                name="tipo"
                value={newTransaction.tipo}
                onChange={handleInputChange}
                required
              >
                <option value="Entrada">Entrada</option>
                <option value="Salida">Salida</option>
              </select>
            </div>
            <div className="form-group">
              <label>Cantidad:</label>
              <input
                type="number"
                name="cantidad"
                value={newTransaction.cantidad}
                onChange={handleInputChange}
                required
                min="1"
              />
            </div>
            <button type="submit" className="btn btn-success">Crear Transacción</button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Lista de Transacciones</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>{getProductName(transaction.producto_id)}</td>
                <td>
                  <span style={{ 
                    color: transaction.tipo === 'Entrada' ? '#27ae60' : '#e74c3c',
                    fontWeight: 'bold'
                  }}>
                    {transaction.tipo}
                  </span>
                </td>
                <td>{transaction.cantidad}</td>
                <td>{transaction.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;

