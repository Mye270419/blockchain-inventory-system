import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Searchbar, Chip, FAB, useTheme, Modal, Portal, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { transactionService, productService } from '../../services/api';

const TransactionsScreen = ({ navigation }) => {
  const theme = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    producto_id: '',
    tipo_transaccion_id: 1,
    cantidad: '',
    precio_unitario: '',
    observaciones: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsResponse, productsResponse] = await Promise.all([
        transactionService.getTransactions(),
        productService.getProducts(),
      ]);
      setTransactions(transactionsResponse.transactions);
      setProducts(productsResponse.products);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const transactionTypes = [
    { id: 1, name: 'Compra', type: 'entrada', icon: 'cart-plus', color: '#27ae60' },
    { id: 2, name: 'Venta', type: 'salida', icon: 'cart-minus', color: '#e74c3c' },
    { id: 3, name: 'Ajuste +', type: 'entrada', icon: 'plus-circle', color: '#3498db' },
    { id: 4, name: 'Ajuste -', type: 'salida', icon: 'minus-circle', color: '#f39c12' },
    { id: 5, name: 'Transferencia In', type: 'entrada', icon: 'arrow-down', color: '#9b59b6' },
    { id: 6, name: 'Transferencia Out', type: 'salida', icon: 'arrow-up', color: '#e67e22' },
  ];

  const getFilteredTransactions = () => {
    let filtered = transactions.filter(transaction =>
      transaction.producto_nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.referencia.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterType !== 'all') {
      const typeInfo = transactionTypes.find(t => t.id === parseInt(filterType));
      if (typeInfo) {
        filtered = filtered.filter(transaction => transaction.tipo_transaccion_id === typeInfo.id);
      }
    }

    return filtered;
  };

  const getTransactionTypeInfo = (typeId) => {
    return transactionTypes.find(t => t.id === typeId) || transactionTypes[0];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCreateTransaction = async () => {
    try {
      if (!newTransaction.producto_id || !newTransaction.cantidad) {
        return;
      }

      const selectedProduct = products.find(p => p.id === parseInt(newTransaction.producto_id));
      
      await transactionService.createTransaction({
        ...newTransaction,
        ubicacion_id: 1, // Almacén principal
        precio_unitario: newTransaction.precio_unitario || selectedProduct?.precio_unitario || 0,
        total: (newTransaction.precio_unitario || selectedProduct?.precio_unitario || 0) * parseInt(newTransaction.cantidad),
      });

      setModalVisible(false);
      setNewTransaction({
        producto_id: '',
        tipo_transaccion_id: 1,
        cantidad: '',
        precio_unitario: '',
        observaciones: '',
      });
      loadData();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const renderTransaction = ({ item }) => {
    const typeInfo = getTransactionTypeInfo(item.tipo_transaccion_id);
    
    return (
      <Card style={styles.transactionCard}>
        <Card.Content>
          <View style={styles.transactionHeader}>
            <View style={styles.transactionInfo}>
              <View style={styles.transactionIcon}>
                <MaterialCommunityIcons 
                  name={typeInfo.icon} 
                  size={24} 
                  color={typeInfo.color} 
                />
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionProduct}>{item.producto_nombre}</Text>
                <Text style={styles.transactionType}>{typeInfo.name}</Text>
                <Text style={styles.transactionDate}>{formatDate(item.fecha_creacion)}</Text>
              </View>
            </View>
            <View style={styles.transactionAmount}>
              <Text style={[
                styles.transactionQuantity,
                { color: typeInfo.color }
              ]}>
                {typeInfo.type === 'entrada' ? '+' : '-'}{item.cantidad}
              </Text>
              <Text style={styles.transactionValue}>
                ${(item.precio_unitario * item.cantidad).toFixed(2)}
              </Text>
            </View>
          </View>

          {item.observaciones && (
            <View style={styles.observationsContainer}>
              <MaterialCommunityIcons name="note-text" size={16} color="#7f8c8d" />
              <Text style={styles.observations}>{item.observaciones}</Text>
            </View>
          )}

          <View style={styles.transactionFooter}>
            <Text style={styles.transactionUser}>Por: {item.usuario_nombre}</Text>
            <Text style={styles.transactionLocation}>{item.ubicacion_nombre}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const filteredTransactions = getFilteredTransactions();

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <Searchbar
        placeholder="Buscar transacciones..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={[{ id: 'all', name: 'Todas' }, ...transactionTypes]}
          renderItem={({ item }) => (
            <Chip
              selected={filterType === item.id.toString()}
              onPress={() => setFilterType(item.id.toString())}
              style={styles.filterChip}
              icon={item.icon}
            >
              {item.name}
            </Chip>
          )}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        />
      </View>

      {/* Lista de transacciones */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.transactionsList}
        refreshing={loading}
        onRefresh={loadData}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="swap-horizontal" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>No se encontraron transacciones</Text>
          </View>
        }
      />

      {/* FAB para nueva transacción */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.tertiary }]}
        onPress={() => setModalVisible(true)}
      />

      {/* Modal de nueva transacción */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Text style={styles.modalTitle}>Nueva Transacción</Text>

              {/* Selector de producto */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Producto</Text>
                <FlatList
                  data={products.slice(0, 5)} // Mostrar solo los primeros 5
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.productOption,
                        newTransaction.producto_id === item.id.toString() && styles.selectedProduct
                      ]}
                      onPress={() => setNewTransaction({
                        ...newTransaction,
                        producto_id: item.id.toString(),
                        precio_unitario: item.precio_unitario.toString(),
                      })}
                    >
                      <Text style={styles.productName}>{item.nombre}</Text>
                      <Text style={styles.productCode}>{item.codigo}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  style={styles.productsList}
                />
              </View>

              {/* Tipo de transacción */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Tipo de Transacción</Text>
                <View style={styles.transactionTypesContainer}>
                  {transactionTypes.slice(0, 4).map((type) => (
                    <Chip
                      key={type.id}
                      selected={newTransaction.tipo_transaccion_id === type.id}
                      onPress={() => setNewTransaction({
                        ...newTransaction,
                        tipo_transaccion_id: type.id
                      })}
                      style={styles.typeChip}
                      icon={type.icon}
                    >
                      {type.name}
                    </Chip>
                  ))}
                </View>
              </View>

              <TextInput
                label="Cantidad"
                value={newTransaction.cantidad}
                onChangeText={(text) => setNewTransaction({
                  ...newTransaction,
                  cantidad: text
                })}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />

              <TextInput
                label="Precio Unitario"
                value={newTransaction.precio_unitario}
                onChangeText={(text) => setNewTransaction({
                  ...newTransaction,
                  precio_unitario: text
                })}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />

              <TextInput
                label="Observaciones (Opcional)"
                value={newTransaction.observaciones}
                onChangeText={(text) => setNewTransaction({
                  ...newTransaction,
                  observaciones: text
                })}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setModalVisible(false)}
                  style={styles.modalButton}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleCreateTransaction}
                  style={[styles.modalButton, { backgroundColor: theme.colors.tertiary }]}
                  disabled={!newTransaction.producto_id || !newTransaction.cantidad}
                >
                  Crear
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchBar: {
    margin: 15,
    elevation: 2,
  },
  filtersContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  filtersContent: {
    paddingVertical: 5,
  },
  filterChip: {
    marginRight: 10,
  },
  transactionsList: {
    padding: 15,
  },
  transactionCard: {
    marginBottom: 15,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  transactionInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionProduct: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 3,
  },
  transactionType: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  transactionDate: {
    fontSize: 12,
    color: '#95a5a6',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionQuantity: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  transactionValue: {
    fontSize: 14,
    color: '#34495e',
  },
  observationsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
  },
  observations: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
    flex: 1,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 10,
  },
  transactionUser: {
    fontSize: 12,
    color: '#95a5a6',
  },
  transactionLocation: {
    fontSize: 12,
    color: '#95a5a6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  productsList: {
    maxHeight: 150,
  },
  productOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 5,
    marginBottom: 5,
  },
  selectedProduct: {
    borderColor: '#3498db',
    backgroundColor: '#ebf3fd',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  productCode: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  transactionTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeChip: {
    marginRight: 10,
    marginBottom: 10,
  },
  input: {
    marginBottom: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default TransactionsScreen;

