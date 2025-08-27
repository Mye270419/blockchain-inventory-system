import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    codigo: '',
    nombre: '',
    precio_unitario: '',
    stock: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data.products);
      setError(null);
    } catch (err) {
      setError('Error al cargar los productos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/products', {
        ...newProduct,
        precio_unitario: parseFloat(newProduct.precio_unitario),
        stock: parseInt(newProduct.stock) || 0
      });
      
      setNewProduct({ codigo: '', nombre: '', precio_unitario: '', stock: '' });
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      setError('Error al crear el producto');
      console.error('Error:', err);
    }
  };

  const handleInputChange = (e) => {
    setNewProduct({
      ...newProduct,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return <div>Cargando productos...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Gestión de Productos</h1>
        <button 
          className="btn btn-success" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : 'Nuevo Producto'}
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Crear Nuevo Producto</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Código:</label>
              <input
                type="text"
                name="codigo"
                value={newProduct.codigo}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                name="nombre"
                value={newProduct.nombre}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Precio Unitario:</label>
              <input
                type="number"
                step="0.01"
                name="precio_unitario"
                value={newProduct.precio_unitario}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Stock Inicial:</label>
              <input
                type="number"
                name="stock"
                value={newProduct.stock}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit" className="btn btn-success">Crear Producto</button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Lista de Productos</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Precio Unitario</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.codigo}</td>
                <td>{product.nombre}</td>
                <td>${product.precio_unitario}</td>
                <td>{product.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;

