import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/inventory/locations');
      setLocations(response.data.locations);
      setError(null);
    } catch (err) {
      setError('Error al cargar las ubicaciones');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando ubicaciones...</div>;

  return (
    <div>
      <h1>Gestión de Ubicaciones</h1>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

      <div className="card">
        <h3>Lista de Ubicaciones</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {locations.map(location => (
              <tr key={location.id}>
                <td>{location.id}</td>
                <td>{location.nombre}</td>
                <td>{location.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Locations;

