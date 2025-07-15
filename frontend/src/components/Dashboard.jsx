import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Dashboard = () => {
  const { apiCall } = useAuth();
  const [summary, setSummary] = useState(null);
  const [transactionsSummary, setTransactionsSummary] = useState(null);
  const [blockchainStats, setBlockchainStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener resumen de inventario
      const inventoryData = await apiCall('/inventory/summary');
      setSummary(inventoryData.summary);
      
      // Obtener resumen de transacciones
      const transactionsData = await apiCall('/transactions/summary');
      setTransactionsSummary(transactionsData.summary);
      
      // Obtener estadísticas de blockchain
      const blockchainData = await apiCall('/blockchain/stats');
      setBlockchainStats(blockchainData.stats);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Productos',
      value: summary?.total_productos || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Valor Inventario',
      value: `$${(summary?.valor_total || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Ubicaciones',
      value: summary?.total_ubicaciones || 0,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Alertas Stock',
      value: summary?.productos_bajo_stock || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transacciones por Día */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Actividad Reciente</span>
            </CardTitle>
            <CardDescription>
              Transacciones de los últimos días
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsSummary?.transacciones_por_dia?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={transactionsSummary.transacciones_por_dia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="fecha" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cantidad" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-500">
                No hay datos de transacciones disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Productos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Productos Principales</span>
            </CardTitle>
            <CardDescription>
              Productos con mayor stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary?.top_productos?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summary.top_productos.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="codigo" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cantidad_total" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-500">
                No hay productos registrados
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertas de Stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Alertas de Stock</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary?.alertas_stock?.length > 0 ? (
                summary.alertas_stock.map((producto, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{producto.codigo}</p>
                      <p className="text-xs text-gray-600">{producto.nombre}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">
                        {producto.stock_actual}
                      </p>
                      <p className="text-xs text-gray-500">
                        Min: {producto.stock_minimo}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No hay alertas de stock</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tipos de Transacciones */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactionsSummary?.transacciones_por_tipo?.map((tipo, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {tipo.es_entrada ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm">{tipo.tipo}</span>
                  </div>
                  <Badge variant="secondary">
                    {tipo.cantidad}
                  </Badge>
                </div>
              )) || (
                <p className="text-gray-500 text-sm">No hay transacciones registradas</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estado Blockchain */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Estado Blockchain</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Productos en Blockchain</span>
                <Badge variant="outline">
                  {blockchainStats?.productos_en_blockchain || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Transacciones Confirmadas</span>
                <Badge variant="outline">
                  {blockchainStats?.transacciones_confirmadas || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Registros de Auditoría</span>
                <Badge variant="outline">
                  {blockchainStats?.total_registros_auditoria || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pendientes</span>
                <Badge variant={blockchainStats?.registros_pendientes > 0 ? "destructive" : "secondary"}>
                  {blockchainStats?.registros_pendientes || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

