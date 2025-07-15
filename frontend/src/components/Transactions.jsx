import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpRight, ArrowDownRight, Search, Plus } from 'lucide-react';

const Transactions = () => {
  const { apiCall } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/transactions');
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.producto_codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.producto_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.tipo_transaccion_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transacciones</h2>
          <p className="text-gray-600">Historial de movimientos de inventario</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Transacción
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar transacciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.map(transaction => (
          <Card key={transaction.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${transaction.es_entrada ? 'bg-green-100' : 'bg-red-100'}`}>
                    {transaction.es_entrada ? (
                      <ArrowUpRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{transaction.producto_codigo} - {transaction.producto_nombre}</h3>
                    <p className="text-sm text-gray-600">{transaction.tipo_transaccion_nombre}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{transaction.cantidad} unidades</p>
                      <p className="text-sm text-gray-600">{transaction.ubicacion_nombre}</p>
                    </div>
                    <Badge variant={transaction.es_entrada ? "default" : "secondary"}>
                      {transaction.es_entrada ? 'Entrada' : 'Salida'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(transaction.fecha_transaccion).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {transaction.referencia && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>Referencia:</strong> {transaction.referencia}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <ArrowUpRight className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay transacciones</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No se encontraron transacciones con los filtros aplicados' : 'No hay transacciones registradas'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Transactions;

