import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, TextInput, Button, Avatar, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    direccion: user?.direccion || '',
  });

  const handleSave = async () => {
    try {
      // Aquí implementarías la actualización del perfil
      console.log('Updating profile:', formData);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const menuItems = [
    {
      title: 'Mis Pedidos',
      subtitle: 'Ver historial de pedidos',
      icon: 'clipboard-list',
      onPress: () => navigation.navigate('Orders'),
    },
    {
      title: 'Mi Carrito',
      subtitle: 'Ver productos en el carrito',
      icon: 'cart',
      onPress: () => navigation.navigate('Cart'),
    },
    {
      title: 'Métodos de Pago',
      subtitle: 'Gestionar formas de pago',
      icon: 'credit-card',
      onPress: () => {/* Implementar */},
    },
    {
      title: 'Direcciones',
      subtitle: 'Gestionar direcciones de entrega',
      icon: 'map-marker',
      onPress: () => {/* Implementar */},
    },
    {
      title: 'Notificaciones',
      subtitle: 'Configurar notificaciones',
      icon: 'bell',
      onPress: () => {/* Implementar */},
    },
    {
      title: 'Ayuda y Soporte',
      subtitle: 'Obtener ayuda',
      icon: 'help-circle',
      onPress: () => {/* Implementar */},
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header del perfil */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text 
            size={80} 
            label={user?.nombre?.charAt(0) || user?.username?.charAt(0) || 'U'}
            style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.nombre || user?.username}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Text style={styles.userRole}>Cliente</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Información personal */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            <Button
              mode="text"
              onPress={() => setEditing(!editing)}
              textColor={theme.colors.primary}
            >
              {editing ? 'Cancelar' : 'Editar'}
            </Button>
          </View>

          <TextInput
            label="Nombre Completo"
            value={formData.nombre}
            onChangeText={(text) => setFormData({ ...formData, nombre: text })}
            mode="outlined"
            style={styles.input}
            editable={editing}
            left={<TextInput.Icon icon="account" />}
          />
          
          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            mode="outlined"
            style={styles.input}
            editable={editing}
            keyboardType="email-address"
            left={<TextInput.Icon icon="email" />}
          />
          
          <TextInput
            label="Teléfono"
            value={formData.telefono}
            onChangeText={(text) => setFormData({ ...formData, telefono: text })}
            mode="outlined"
            style={styles.input}
            editable={editing}
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="phone" />}
          />
          
          <TextInput
            label="Dirección"
            value={formData.direccion}
            onChangeText={(text) => setFormData({ ...formData, direccion: text })}
            mode="outlined"
            style={styles.input}
            editable={editing}
            multiline
            numberOfLines={3}
            left={<TextInput.Icon icon="map-marker" />}
          />

          {editing && (
            <Button
              mode="contained"
              onPress={handleSave}
              style={[styles.saveButton, { backgroundColor: theme.colors.tertiary }]}
              labelStyle={styles.buttonLabel}
              icon="content-save"
            >
              Guardar Cambios
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Menú de opciones */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Opciones</Text>
          {menuItems.map((item, index) => (
            <View key={index} style={styles.menuItem}>
              <View style={styles.menuItemContent}>
                <MaterialCommunityIcons 
                  name={item.icon} 
                  size={24} 
                  color={theme.colors.primary}
                  style={styles.menuIcon}
                />
                <View style={styles.menuText}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={20} 
                color="#bdc3c7" 
              />
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Estadísticas del usuario */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Mis Estadísticas</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="shopping" size={30} color={theme.colors.primary} />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Pedidos</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="currency-usd" size={30} color={theme.colors.tertiary} />
              <Text style={styles.statNumber}>$450</Text>
              <Text style={styles.statLabel}>Total Gastado</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="star" size={30} color="#f39c12" />
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>Calificación</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Botón de cerrar sesión */}
      <View style={styles.logoutContainer}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          labelStyle={styles.logoutButtonLabel}
          textColor="#e74c3c"
          icon="logout"
        >
          Cerrar Sesión
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  profileCard: {
    margin: 15,
    elevation: 2,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  userRole: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: 'bold',
  },
  card: {
    margin: 15,
    marginTop: 0,
    elevation: 2,
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
  input: {
    marginBottom: 15,
  },
  saveButton: {
    marginTop: 10,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 5,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 3,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 5,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  logoutContainer: {
    padding: 15,
  },
  logoutButton: {
    borderColor: '#e74c3c',
    borderRadius: 8,
  },
  logoutButtonLabel: {
    fontSize: 16,
    paddingVertical: 5,
  },
});

export default ProfileScreen;

