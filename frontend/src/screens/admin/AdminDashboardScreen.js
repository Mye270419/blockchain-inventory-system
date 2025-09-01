import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useAuth } from '../../contexts/AuthContext';
import { inventoryService, transactionService, orderService, userService } from '../../services/api';

const { width: screenWidth } = Dimensions.get('window');

const AdminDashboardScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    recentTransactions: [],
    salesData: [],
    categoryData: [],
    monthlyRevenue: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [inventoryResponse, transactionsResponse, ordersResponse, usersResponse] = await Promise.all([
        inventoryService.getSummary(),
        transactionService.getTransactions(),
        orderService.getAllOrders(),
        userService.getUsers(),
      ]);
      
      // Procesar datos para gráficos
      const salesData = processSalesData(transactionsResponse.transactions);
      const categoryData = processCategoryData(inventoryResponse.summary);
      const monthlyRevenue = processMonthlyRevenue(ordersResponse.orders);
      
      setDashboardData({
        totalProducts: inventoryResponse.summary.total_productos,
        totalUsers: usersResponse.users.length,
        totalOrders: ordersResponse.orders.length,
        totalRevenue: ordersResponse.orders.reduce((sum, order) => sum + parseFloat(order.total), 0),
        lowStockProducts: inventoryResponse.summary.productos_bajo_stock,
        recentTransactions: transactionsResponse.transactions.slice(0, 5),
        salesData,
        categoryData,
        monthlyRevenue,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processSalesData = (transactions) => {
    // Simular datos de ventas por día
    return {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      datasets: [{
        data: [120, 150, 180, 200, 160, 220, 190],
        color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
        strokeWidth: 2,
      }],
    };
  };

  const processCategoryData = (summary) => {
    // Simular datos de categorías
    return [
      { name: 'Computadoras', population: 35, color: '#3498db', legendFontColor: '#7F7F7F' },
      { name: 'Muebles', population: 25, color: '#e74c3c', legendFontColor: '#7F7F7F' },
      { name: 'Comidas', population: 20, color: '#f39c12', legendFontColor: '#7F7F7F' },
      { name: 'Electrónicos', population: 20, color: '#27ae60', legendFontColor: '#7F7F7F' },
    ];
  };

  const processMonthlyRevenue = (orders) => {
    // Simular ingresos mensuales
    return {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [{
        data: [1200, 1800, 1500, 2200, 1900, 2500],
      }],
    };
  };

  const quickActions = [
    {
      title: 'Gestión de Usuarios',
      subtitle: 'Administrar usuarios',
      icon: 'account-group',
      color: '#3498db',
      onPress: () => navigation.navigate('UserManagement'),
    },
    {
      title: 'Reportes Avanzados',
      subtitle: 'Análisis y reportes',
      icon: 'chart-line',
      color: '#27ae60',
      onPress: () => navigation.navigate('Reports'),
    },
    {
      title: 'Configuración',
      subtitle: 'Configurar sistema',
      icon: 'cog',
      color: '#9b59b6',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      title: 'Auditoría Blockchain',
      subtitle: 'Verificar transacciones',
      icon: 'shield-check',
      color: '#e67e22',
      onPress: () => navigation.navigate('Blockchain'),
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#3498db',
    },
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
            <MaterialCommunityIcons name="shield-crown" size={40} color="#fff" />
            <View style={styles.userText}>
              <Text style={styles.greeting}>¡Hola, {user?.nombre || user?.username}!</Text>
              <Text style={styles.subtitle}>Panel de Administrador</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <MaterialCommunityIcons name="cog" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Métricas principales */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricsRow}>
          <Card style={[styles.metricCard, { backgroundColor: '#3498db' }]}>
            <Card.Content style={styles.metricContent}>
              <MaterialCommunityIcons name="account-group" size={30} color="#fff" />
              <Text style={styles.metricNumber}>{dashboardData.totalUsers}</Text>
              <Text style={styles.metricLabel}>Usuarios</Text>
            </Card.Content>
          </Card>
          
          <Card style={[styles.metricCard, { backgroundColor: '#27ae60' }]}>
            <Card.Content style={styles.metricContent}>
              <MaterialCommunityIcons name="clipboard-list" size={30} color="#fff" />
              <Text style={styles.metricNumber}>{dashboardData.totalOrders}</Text>
              <Text style={styles.metricLabel}>Pedidos</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.metricsRow}>
          <Card style={[styles.metricCard, { backgroundColor: '#e74c3c' }]}>
            <Card.Content style={styles.metricContent}>
              <MaterialCommunityIcons name="cube-outline" size={30} color="#fff" />
              <Text style={styles.metricNumber}>{dashboardData.totalProducts}</Text>
              <Text style={styles.metricLabel}>Productos</Text>
            </Card.Content>
          </Card>
          
          <Card style={[styles.metricCard, { backgroundColor: '#f39c12' }]}>
            <Card.Content style={styles.metricContent}>
              <MaterialCommunityIcons name="currency-usd" size={30} color="#fff" />
              <Text style={styles.metricNumber}>{formatCurrency(dashboardData.totalRevenue)}</Text>
              <Text style={styles.metricLabel}>Ingresos</Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Gráfico de ventas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ventas de la Semana</Text>
        <Card style={styles.chartCard}>
          <Card.Content>
            <LineChart
              data={dashboardData.salesData}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </Card.Content>
        </Card>
      </View>

      {/* Distribución por categorías */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribución por Categorías</Text>
        <Card style={styles.chartCard}>
          <Card.Content>
            <PieChart
              data={dashboardData.categoryData}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </Card.Content>
        </Card>
      </View>

      {/* Ingresos mensuales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingresos Mensuales</Text>
        <Card style={styles.chartCard}>
          <Card.Content>
            <BarChart
              data={dashboardData.monthlyRevenue}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel="$"
              yAxisSuffix=""
            />
          </Card.Content>
        </Card>
      </View>

      {/* Acciones rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Herramientas de Administración</Text>
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

      {/* Alertas del sistema */}
      {dashboardData.lowStockProducts > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas del Sistema</Text>
          <Card style={styles.alertCard}>
            <Card.Content>
              <View style={styles.alertContent}>
                <MaterialCommunityIcons name="alert-circle" size={30} color="#e74c3c" />
                <View style={styles.alertText}>
                  <Text style={styles.alertTitle}>Productos con Stock Bajo</Text>
                  <Text style={styles.alertSubtitle}>
                    {dashboardData.lowStockProducts} productos necesitan reabastecimiento urgente
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.alertButton}
                  onPress={() => navigation.navigate('Inventory')}
                >
                  <Text style={styles.alertButtonText}>Revisar</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  chartCard: {
    elevation: 2,
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
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

export default AdminDashboardScreen;

