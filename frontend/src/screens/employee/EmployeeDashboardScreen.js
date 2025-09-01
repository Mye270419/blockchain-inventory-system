import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { inventoryService, transactionService, orderService } from '../../services/api';

const EmployeeDashboardScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalValue: 0,
    recentTransactions: [],
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [inventoryResponse, transactionsResponse] = await Promise.all([
        inventoryService.getSummary(),
        transactionService.getTransactions(),
      ]);
      
      setDashboardData({
        totalProducts: inventoryResponse.summary.total_productos,
        lowStockProducts: inventoryResponse.summary.productos_bajo_stock,
        totalValue: inventoryResponse.summary.valor_total,
        recentTransactions: transactionsResponse.transactions.slice(0, 5),
        pendingOrders: 8, // Simulado
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Gestionar Inventario',
      subtitle: 'Ver y actualizar stock',
      icon: 'package-variant',
      color: '#3498db',
      onPress: () => navigation.navigate('Inventory'),
    },
    {
      title: 'Nueva Transacción',
      subtitle: 'Registrar movimiento',
      icon: 'swap-horizontal',
      color: '#27ae60',
      onPress: () => navigation.navigate('Transactions'),
    },
    {
      title: 'Gestionar Productos',
      subtitle: 'Agregar/editar productos',
      icon: 'cube-outline',
      color: '#9b59b6',
      onPress: () => navigation.navigate('Products'),
    },
    {
      title: 'Pedidos Pendientes',
      subtitle: 'Procesar pedidos',
      icon: 'clipboard-list',
      color: '#e67e22',
      onPress: () => navigation.navigate('OrderManagement'),
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <MaterialCommunityIcons name="account-tie" size={40} color="#fff" />
            <View style={styles.userText}>
              <Text style={styles.greeting}>¡Hola, {user?.nombre || user?.username}!</Text>
              <Text style={styles.subtitle}>Panel de Empleado</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="cog" size={24} color="#fff" />
        </View>
      </LinearGradient>

      {/* Métricas principales */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricsRow}>
          <Card style={[styles.metricCard, { backgroundColor: '#3498db' }]}>
            <Card.Content style={styles.metricContent}>
              <MaterialCommunityIcons name="cube-outline" size={30} color="#fff" />
              <Text style={styles.metricNumber}>{dashboardData.totalProducts}</Text>
              <Text style={styles.metricLabel}>Productos</Text>
            </Card.Content>
          </Card>
          
          <Card style={[styles.metricCard, { backgroundColor: '#e74c3c' }]}>
            <Card.Content style={styles.metricContent}>
              <MaterialCommunityIcons name="alert" size={30} color="#fff" />
              <Text style={styles.metricNumber}>{dashboardData.lowStockProducts}</Text>
              <Text style={styles.metricLabel}>Stock Bajo</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.metricsRow}>
          <Card style={[styles.metricCard, { backgroundColor: '#27ae60' }]}>
            <Card.Content style={styles.metricContent}>
              <MaterialCommunityIcons name="currency-usd" size={30} color="#fff" />
              <Text style={styles.metricNumber}>{formatCurrency(dashboardData.totalValue)}</Text>
              <Text style={styles.metricLabel}>Valor Total</Text>
            </Card.Content>
          </Card>
          
          <Card style={[styles.metricCard, { backgroundColor: '#f39c12' }]}>
            <Card.Content style={styles.metricContent}>
              <MaterialCommunityIcons name="clipboard-list" size={30} color="#fff" />
              <Text style={styles.metricNumber}>{dashboardData.pendingOrders}</Text>
              <Text style={styles.metricLabel}>Pedidos</Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Acciones rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickActionCard}
              onPress={action.onPress}
            >
              <Card style={styles.quickActionCardContent}>
                <Card.Content style={styles.quickActionContent}>
                  <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                    <MaterialCommunityIcons name={action.icon} size={30} color="#fff" />
                  </View>
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Transacciones recientes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        
        <Card style={styles.transactionsCard}>
          <Card.Content>
            {dashboardData.recentTransactions.length > 0 ? (
              dashboardData.recentTransactions.map((transaction, index) => (
                <View key={index} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <MaterialCommunityIcons 
                      name={transaction.tipo_nombre === 'Entrada' ? 'arrow-down' : 'arrow-up'} 
                      size={20} 
                      color={transaction.tipo_nombre === 'Entrada' ? '#27ae60' : '#e74c3c'} 
                    />
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionProduct}>{transaction.producto_nombre}</Text>
                      <Text style={styles.transactionDate}>{formatDate(transaction.fecha_creacion)}</Text>
                    </View>
                  </View>
                  <View style={styles.transactionAmount}>
                    <Text style={[
                      styles.transactionQuantity,
                      { color: transaction.tipo_nombre === 'Entrada' ? '#27ae60' : '#e74c3c' }
                    ]}>
                      {transaction.tipo_nombre === 'Entrada' ? '+' : '-'}{transaction.cantidad}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyTransactions}>
                <MaterialCommunityIcons name="swap-horizontal" size={40} color="#bdc3c7" />
                <Text style={styles.emptyText}>No hay transacciones recientes</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* Alertas de stock */}
      {dashboardData.lowStockProducts > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas de Stock</Text>
          <Card style={styles.alertCard}>
            <Card.Content>
              <View style={styles.alertContent}>
                <MaterialCommunityIcons name="alert-circle" size={30} color="#e74c3c" />
                <View style={styles.alertText}>
                  <Text style={styles.alertTitle}>Stock Bajo Detectado</Text>
                  <Text style={styles.alertSubtitle}>
                    {dashboardData.lowStockProducts} productos necesitan reabastecimiento
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.alertButton}
                  onPress={() => navigation.navigate('Inventory')}
                >
                  <Text style={styles.alertButtonText}>Ver</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    marginLeft: 15,
  },
  greeting: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#ecf0f1',
    fontSize: 14,
  },
  metricsContainer: {
    padding: 15,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  metricCard: {
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
  },
  metricContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  metricNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  metricLabel: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    padding: 15,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    marginBottom: 15,
  },
  quickActionCardContent: {
    elevation: 2,
  },
  quickActionContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 5,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  transactionsCard: {
    elevation: 2,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionDetails: {
    marginLeft: 15,
    flex: 1,
  },
  transactionProduct: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  transactionDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 10,
  },
  alertCard: {
    elevation: 2,
    backgroundColor: '#fff5f5',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertText: {
    flex: 1,
    marginLeft: 15,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 5,
  },
  alertSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  alertButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default EmployeeDashboardScreen;

