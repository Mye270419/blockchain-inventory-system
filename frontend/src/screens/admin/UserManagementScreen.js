import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Searchbar, Chip, FAB, useTheme, Modal, Portal, TextInput, Button, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { userService } from '../../services/api';

const UserManagementScreen = ({ navigation }) => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    nombre: '',
    telefono: '',
    direccion: '',
    rol: 'cliente',
    activo: true,
  });

  const roles = [
    { key: 'all', label: 'Todos', color: '#95a5a6' },
    { key: 'administrador', label: 'Administradores', color: '#e74c3c' },
    { key: 'empleado', label: 'Empleados', color: '#3498db' },
    { key: 'cliente', label: 'Clientes', color: '#27ae60' },
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      setUsers(response.users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredUsers = () => {
    let filtered = users.filter(user =>
      user.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.rol === filterRole);
    }

    return filtered;
  };

  const getRoleInfo = (role) => {
    return roles.find(r => r.key === role) || roles[0];
  };

  const getRoleIcon = (role) => {
    const icons = {
      'administrador': 'shield-crown',
      'empleado': 'account-tie',
      'cliente': 'account',
    };
    return icons[role] || 'account';
  };

  const handleCreateUser = async () => {
    try {
      if (!newUser.username || !newUser.email || !newUser.nombre) {
        return;
      }

      if (editingUser) {
        // Actualizar usuario existente
        await userService.updateUser(editingUser.id, newUser);
      } else {
        // Crear nuevo usuario
        await userService.createUser({
          ...newUser,
          password: 'temporal123', // Contraseña temporal
        });
      }

      setModalVisible(false);
      resetForm();
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUser({
      username: user.username,
      email: user.email,
      nombre: user.nombre,
      telefono: user.telefono || '',
      direccion: user.direccion || '',
      rol: user.rol,
      activo: user.activo,
    });
    setModalVisible(true);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await userService.updateUser(userId, { activo: !currentStatus });
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setNewUser({
      username: '',
      email: '',
      nombre: '',
      telefono: '',
      direccion: '',
      rol: 'cliente',
      activo: true,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderUser = ({ item }) => {
    const roleInfo = getRoleInfo(item.rol);
    
    return (
      <Card style={styles.userCard}>
        <Card.Content>
          <View style={styles.userHeader}>
            <View style={styles.userInfo}>
              <Avatar.Text 
                size={50} 
                label={item.nombre.charAt(0)}
                style={[styles.avatar, { backgroundColor: roleInfo.color }]}
              />
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{item.nombre}</Text>
                <Text style={styles.userUsername}>@{item.username}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
              </View>
            </View>
            <View style={styles.userStatus}>
              <Chip
                icon={getRoleIcon(item.rol)}
                textStyle={{ color: roleInfo.color }}
                style={[styles.roleChip, { borderColor: roleInfo.color }]}
                mode="outlined"
              >
                {roleInfo.label.slice(0, -1)} {/* Remover la 's' del plural */}
              </Chip>
              <Chip
                icon={item.activo ? 'check-circle' : 'close-circle'}
                textStyle={{ color: item.activo ? '#27ae60' : '#e74c3c' }}
                style={[
                  styles.statusChip, 
                  { borderColor: item.activo ? '#27ae60' : '#e74c3c' }
                ]}
                mode="outlined"
              >
                {item.activo ? 'Activo' : 'Inactivo'}
              </Chip>
            </View>
          </View>

          <View style={styles.userMetadata}>
            <View style={styles.metadataItem}>
              <MaterialCommunityIcons name="calendar" size={16} color="#7f8c8d" />
              <Text style={styles.metadataText}>
                Registrado: {formatDate(item.fecha_creacion)}
              </Text>
            </View>
            {item.telefono && (
              <View style={styles.metadataItem}>
                <MaterialCommunityIcons name="phone" size={16} color="#7f8c8d" />
                <Text style={styles.metadataText}>{item.telefono}</Text>
              </View>
            )}
            {item.direccion && (
              <View style={styles.metadataItem}>
                <MaterialCommunityIcons name="map-marker" size={16} color="#7f8c8d" />
                <Text style={styles.metadataText} numberOfLines={1}>{item.direccion}</Text>
              </View>
            )}
          </View>

          <View style={styles.userActions}>
            <Button
              mode="outlined"
              onPress={() => handleEditUser(item)}
              style={styles.actionButton}
              icon="pencil"
            >
              Editar
            </Button>
            <Button
              mode={item.activo ? "outlined" : "contained"}
              onPress={() => handleToggleUserStatus(item.id, item.activo)}
              style={[
                styles.actionButton,
                !item.activo && { backgroundColor: '#27ae60' }
              ]}
              textColor={item.activo ? '#e74c3c' : '#fff'}
              icon={item.activo ? 'account-off' : 'account-check'}
            >
              {item.activo ? 'Desactivar' : 'Activar'}
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const filteredUsers = getFilteredUsers();

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <Searchbar
        placeholder="Buscar usuarios..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Filtros de roles */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={roles}
          renderItem={({ item }) => (
            <Chip
              selected={filterRole === item.key}
              onPress={() => setFilterRole(item.key)}
              style={styles.filterChip}
              textStyle={filterRole === item.key ? { color: '#fff' } : { color: item.color }}
              selectedColor={item.color}
            >
              {item.label}
            </Chip>
          )}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        />
      </View>

      {/* Estadísticas rápidas */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{users.filter(u => u.rol === 'administrador').length}</Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{users.filter(u => u.rol === 'empleado').length}</Text>
          <Text style={styles.statLabel}>Empleados</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{users.filter(u => u.rol === 'cliente').length}</Text>
          <Text style={styles.statLabel}>Clientes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{users.filter(u => u.activo).length}</Text>
          <Text style={styles.statLabel}>Activos</Text>
        </View>
      </View>

      {/* Lista de usuarios */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.usersList}
        refreshing={loading}
        onRefresh={loadUsers}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-group" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>No se encontraron usuarios</Text>
          </View>
        }
      />

      {/* FAB para nuevo usuario */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.tertiary }]}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      />

      {/* Modal de usuario */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Text style={styles.modalTitle}>
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </Text>

              <TextInput
                label="Nombre de Usuario"
                value={newUser.username}
                onChangeText={(text) => setNewUser({ ...newUser, username: text })}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="account" />}
              />

              <TextInput
                label="Email"
                value={newUser.email}
                onChangeText={(text) => setNewUser({ ...newUser, email: text })}
                mode="outlined"
                keyboardType="email-address"
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
              />

              <TextInput
                label="Nombre Completo"
                value={newUser.nombre}
                onChangeText={(text) => setNewUser({ ...newUser, nombre: text })}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="account-circle" />}
              />

              <TextInput
                label="Teléfono (Opcional)"
                value={newUser.telefono}
                onChangeText={(text) => setNewUser({ ...newUser, telefono: text })}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
                left={<TextInput.Icon icon="phone" />}
              />

              <TextInput
                label="Dirección (Opcional)"
                value={newUser.direccion}
                onChangeText={(text) => setNewUser({ ...newUser, direccion: text })}
                mode="outlined"
                multiline
                numberOfLines={2}
                style={styles.input}
                left={<TextInput.Icon icon="map-marker" />}
              />

              {/* Selector de rol */}
              <View style={styles.roleContainer}>
                <Text style={styles.inputLabel}>Rol del Usuario</Text>
                <View style={styles.rolesGrid}>
                  {roles.slice(1).map((role) => (
                    <Chip
                      key={role.key}
                      selected={newUser.rol === role.key}
                      onPress={() => setNewUser({ ...newUser, rol: role.key })}
                      style={styles.roleChipModal}
                      icon={getRoleIcon(role.key)}
                    >
                      {role.label.slice(0, -1)} {/* Remover la 's' del plural */}
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Usuario Activo</Text>
                <Button
                  mode={newUser.activo ? "contained" : "outlined"}
                  onPress={() => setNewUser({ ...newUser, activo: !newUser.activo })}
                  style={styles.switchButton}
                >
                  {newUser.activo ? "Sí" : "No"}
                </Button>
              </View>

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
                  onPress={handleCreateUser}
                  style={[styles.modalButton, { backgroundColor: theme.colors.tertiary }]}
                  disabled={!newUser.username || !newUser.email || !newUser.nombre}
                >
                  {editingUser ? 'Actualizar' : 'Crear'}
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  usersList: {
    padding: 15,
  },
  userCard: {
    marginBottom: 15,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 3,
  },
  userUsername: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  userEmail: {
    fontSize: 14,
    color: '#34495e',
  },
  userStatus: {
    alignItems: 'flex-end',
  },
  roleChip: {
    backgroundColor: 'transparent',
    marginBottom: 5,
  },
  statusChip: {
    backgroundColor: 'transparent',
  },
  userMetadata: {
    marginBottom: 15,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  metadataText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 8,
    flex: 1,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
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
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  roleContainer: {
    marginBottom: 15,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roleChipModal: {
    marginRight: 10,
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  switchButton: {
    minWidth: 60,
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

export default UserManagementScreen;

