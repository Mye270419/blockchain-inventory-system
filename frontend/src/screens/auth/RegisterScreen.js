import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const theme = useTheme();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await register({
      username,
      email,
      password,
      nombre,
      telefono,
      direccion,
      rol: 'cliente', // Por defecto, los registros son para clientes
    });

    if (result.success) {
      setSuccess('Registro exitoso. Ahora puedes iniciar sesión.');
      // Opcional: navegar a la pantalla de login después de un tiempo
      setTimeout(() => navigation.navigate('Login'), 2000);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.content}>
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Registrarse</Text>

          <TextInput
            label="Nombre de Usuario"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            style={styles.input}
            theme={{ colors: { primary: theme.colors.tertiary } }}
            left={<TextInput.Icon icon="account" color={theme.colors.tertiary} />}
          />
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            theme={{ colors: { primary: theme.colors.tertiary } }}
            left={<TextInput.Icon icon="email" color={theme.colors.tertiary} />}
          />
          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            theme={{ colors: { primary: theme.colors.tertiary } }}
            left={<TextInput.Icon icon="lock" color={theme.colors.tertiary} />}
          />
          <TextInput
            label="Confirmar Contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            theme={{ colors: { primary: theme.colors.tertiary } }}
            left={<TextInput.Icon icon="lock-check" color={theme.colors.tertiary} />}
          />
          <TextInput
            label="Nombre Completo (Opcional)"
            value={nombre}
            onChangeText={setNombre}
            mode="outlined"
            style={styles.input}
            theme={{ colors: { primary: theme.colors.tertiary } }}
            left={<TextInput.Icon icon="card-account-details" color={theme.colors.tertiary} />}
          />
          <TextInput
            label="Teléfono (Opcional)"
            value={telefono}
            onChangeText={setTelefono}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            theme={{ colors: { primary: theme.colors.tertiary } }}
            left={<TextInput.Icon icon="phone" color={theme.colors.tertiary} />}
          />
          <TextInput
            label="Dirección (Opcional)"
            value={direccion}
            onChangeText={setDireccion}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            theme={{ colors: { primary: theme.colors.tertiary } }}
            left={<TextInput.Icon icon="map-marker" color={theme.colors.tertiary} />}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            buttonColor={theme.colors.tertiary}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.loginButton}
            labelStyle={styles.loginButtonLabel}
            textColor={theme.colors.onPrimary}
          >
            ¿Ya tienes cuenta? Inicia Sesión
          </Button>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  content: {
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    elevation: 5,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  successText: {
    color: 'green',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    marginVertical: 10,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 18,
    paddingVertical: 5,
  },
  loginButton: {
    marginTop: 10,
  },
  loginButtonLabel: {
    fontSize: 14,
  },
});

export default RegisterScreen;

