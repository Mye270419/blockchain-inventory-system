import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Activity, CheckCircle, Clock } from 'lucide-react';

const Blockchain = () => {
  const { apiCall } = useAuth();
  const [stats, setStats] = useState(null);
  const [auditTrail, setAuditTrail] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlockchainData();
  }, []);

  const fetchBlockchainData = async () => {
    try {
      setLoading(true);
      const [statsData, auditData] = await Promise.all([
        apiCall('/blockchain/stats'),
        apiCall('/blockchain/audit')
      ]);
      
      setStats(statsData.stats);
      setAuditTrail(auditData.audit_trail || []);
    } catch (error) {
      console.error('Error fetching blockchain data:', error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Blockchain
        </h2>
        <p className="text-gray-600">Estado y auditoría de la blockchain</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productos en Blockchain</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.productos_en_blockchain || 0}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transacciones Confirmadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.transacciones_confirmadas || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Registros de Auditoría</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_registros_auditoria || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.registros_pendientes || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimos registros en la blockchain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditTrail.length > 0 ? (
              auditTrail.slice(0, 10).map((record, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${record.confirmado ? 'bg-green-100' : 'bg-orange-100'}`}>
                      {record.confirmado ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{record.tabla_afectada} - {record.accion}</p>
                      <p className="text-sm text-gray-600">ID: {record.registro_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={record.confirmado ? "default" : "secondary"}>
                      {record.confirmado ? 'Confirmado' : 'Pendiente'}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(record.fecha_evento).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No hay actividad registrada</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Blockchain;

