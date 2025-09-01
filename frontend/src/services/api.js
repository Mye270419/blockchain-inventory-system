import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Configuración base de la API
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token de autenticación
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado, limpiar storage
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userInfo');
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Servicios de productos
export const productService = {
  getProducts: async (filters = {}) => {
    const response = await api.get('/products', { params: filters });
    return response.data;
  },
  
  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

// Servicios de inventario
export const inventoryService = {
  getSummary: async () => {
    const response = await api.get('/inventory/summary');
    return response.data;
  },
  
  getInventory: async (filters = {}) => {
    const response = await api.get('/inventory', { params: filters });
    return response.data;
  },
  
  getLowStock: async () => {
    const response = await api.get('/inventory/low-stock');
    return response.data;
  },
  
  getLocations: async () => {
    const response = await api.get('/inventory/locations');
    return response.data;
  },
};

// Servicios de transacciones
export const transactionService = {
  getTransactions: async (filters = {}) => {
    const response = await api.get('/transactions', { params: filters });
    return response.data;
  },
  
  createTransaction: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },
};

// Servicios de carrito y pedidos (para clientes)
export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  getOrders: async (userId) => {
    const response = await api.get(`/orders/user/${userId}`);
    return response.data;
  },
  
  getOrder: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
  
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },
};

// Servicios de pago
export const paymentService = {
  createPayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },
  
  getPaymentMethods: async () => {
    const response = await api.get('/payments/methods');
    return response.data;
  },
  
  generateQRCode: async (orderId) => {
    const response = await api.post(`/payments/qr/${orderId}`);
    return response.data;
  },
};

// Servicios de categorías
export const categoryService = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },
};

// Servicios de blockchain
export const blockchainService = {
  getNetworkInfo: async () => {
    const response = await api.get('/blockchain/network-info');
    return response.data;
  },
  
  getProductBlockchain: async (productId) => {
    const response = await api.get(`/blockchain/products/${productId}`);
    return response.data;
  },
  
  getTransactionBlockchain: async (transactionId) => {
    const response = await api.get(`/blockchain/transactions/${transactionId}`);
    return response.data;
  },
};

export default api;

