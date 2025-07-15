# Manual Técnico - Sistema de Inventario Blockchain

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Componentes Principales](#componentes-principales)
4. [Instalación y Configuración](#instalación-y-configuración)
5. [Base de Datos](#base-de-datos)
6. [Smart Contracts](#smart-contracts)
7. [API Backend](#api-backend)
8. [Frontend](#frontend)
9. [Integración Blockchain](#integración-blockchain)
10. [Seguridad](#seguridad)
11. [Mantenimiento](#mantenimiento)
12. [Solución de Problemas](#solución-de-problemas)

## Introducción

El Sistema de Inventario Blockchain es una aplicación completa que combina tecnología blockchain con bases de datos tradicionales para proporcionar un sistema de gestión de inventario transparente, auditable e inmutable.

### Características Principales

- **Gestión de Inventario**: Control completo de productos, ubicaciones, proveedores y categorías
- **Blockchain Integration**: Registro inmutable de todas las transacciones en blockchain
- **Auditoría Automática**: Trazabilidad completa de todas las operaciones
- **Interfaz Web Moderna**: Frontend React con diseño responsivo
- **API RESTful**: Backend Flask con endpoints completos
- **Base de Datos Dual**: SQLite para operaciones rápidas y blockchain para inmutabilidad
- **Autenticación JWT**: Sistema de autenticación seguro
- **Roles de Usuario**: Administradores y operadores con permisos diferenciados

### Tecnologías Utilizadas

- **Frontend**: React 18, Vite, CSS3
- **Backend**: Flask, SQLAlchemy, JWT
- **Blockchain**: Solidity, Web3.py, Truffle, Ganache
- **Base de Datos**: SQLite
- **Autenticación**: JWT (JSON Web Tokens)
- **Cifrado**: bcrypt para contraseñas

## Arquitectura del Sistema

El sistema sigue una arquitectura de tres capas con integración blockchain:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Blockchain    │
│   (React)       │◄──►│   (Flask)       │◄──►│   (Ethereum)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Base de Datos │
                       │   (SQLite)      │
                       └─────────────────┘
```

### Flujo de Datos

1. **Usuario** interactúa con el **Frontend React**
2. **Frontend** envía peticiones HTTP al **Backend Flask**
3. **Backend** procesa la lógica de negocio y actualiza la **Base de Datos SQLite**
4. **Backend** registra transacciones críticas en **Blockchain**
5. **Sistema de Auditoría** mantiene sincronización entre ambos sistemas

## Componentes Principales

### 1. Frontend (React)

**Ubicación**: `/frontend/`

**Componentes Principales**:
- `App.jsx`: Componente principal y enrutamiento
- `Login.jsx`: Autenticación de usuarios
- `Dashboard.jsx`: Panel principal con métricas
- `Products.jsx`: Gestión de productos
- `Inventory.jsx`: Control de inventario
- `Transactions.jsx`: Historial de transacciones
- `Layout.jsx`: Layout principal con navegación

**Características**:
- Diseño responsivo
- Autenticación JWT
- Comunicación con API REST
- Interfaz intuitiva y moderna

### 2. Backend (Flask)

**Ubicación**: `/backend/`

**Estructura**:
```
backend/
├── src/
│   ├── main.py              # Aplicación principal
│   ├── models/
│   │   └── inventory.py     # Modelos de datos
│   ├── routes/
│   │   ├── auth.py          # Autenticación
│   │   ├── products.py      # Gestión de productos
│   │   ├── inventory.py     # Control de inventario
│   │   ├── transactions.py  # Transacciones
│   │   └── blockchain.py    # Integración blockchain
│   └── services/
│       └── blockchain_service.py  # Servicios blockchain
├── database/
│   └── app.db              # Base de datos SQLite
└── requirements.txt        # Dependencias Python
```

### 3. Smart Contracts (Solidity)

**Ubicación**: `/contracts/`

**Contrato Principal**: `InventoryContract.sol`

**Funcionalidades**:
- Registro de productos en blockchain
- Registro de transacciones de inventario
- Verificación de integridad de datos
- Eventos para auditoría

### 4. Base de Datos (SQLite)

**Ubicación**: `/backend/database/app.db`

**Tablas Principales**:
- `usuarios`: Gestión de usuarios y autenticación
- `productos`: Catálogo de productos
- `categorias`: Clasificación de productos
- `proveedores`: Información de proveedores
- `ubicaciones`: Almacenes y ubicaciones
- `inventario`: Stock actual por ubicación
- `transacciones`: Historial de movimientos
- `tipos_transaccion`: Tipos de operaciones
- `auditoria_blockchain`: Registro de sincronización blockchain




## Instalación y Configuración

### Requisitos del Sistema

**Software Requerido**:
- Python 3.11+
- Node.js 20+
- npm/pnpm
- Git

**Recursos Mínimos**:
- RAM: 4GB
- Almacenamiento: 2GB
- Procesador: Dual-core 2GHz

### Instalación Paso a Paso

#### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd blockchain-inventory-system
```

#### 2. Configurar Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Linux/Mac:
source venv/bin/activate
# En Windows:
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Crear directorio de base de datos
mkdir -p database

# Inicializar base de datos con datos de prueba
python simple_init.py
```

#### 3. Configurar Frontend

```bash
cd ../frontend

# Instalar dependencias
pnpm install
```

#### 4. Configurar Blockchain (Opcional)

```bash
cd ../contracts

# Instalar dependencias de blockchain
npm install

# Iniciar Ganache (en terminal separada)
npx ganache-cli --deterministic --accounts 10 --host 0.0.0.0

# Compilar contratos
npx truffle compile

# Desplegar contratos (si Ganache está corriendo)
npx truffle migrate --network development
```

### Variables de Entorno

Crear archivo `.env` en `/backend/`:

```env
# Configuración de Flask
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=tu-clave-secreta-muy-segura

# Base de datos
DATABASE_URL=sqlite:///database/app.db

# JWT
JWT_SECRET_KEY=tu-jwt-secret-key

# Blockchain
BLOCKCHAIN_URL=http://localhost:8545
CONTRACT_ADDRESS=0x...  # Dirección del contrato desplegado
PRIVATE_KEY=0x...       # Clave privada para transacciones
```

### Iniciar el Sistema

#### 1. Iniciar Backend

```bash
cd backend
source venv/bin/activate
python src/main.py
```

El backend estará disponible en: `http://localhost:5000`

#### 2. Iniciar Frontend

```bash
cd frontend
pnpm run dev --host
```

El frontend estará disponible en: `http://localhost:5173`

#### 3. Iniciar Blockchain (Opcional)

```bash
cd contracts
npx ganache-cli --deterministic --accounts 10 --host 0.0.0.0
```

La blockchain local estará disponible en: `http://localhost:8545`

### Credenciales por Defecto

**Administrador**:
- Usuario: `admin`
- Contraseña: `admin123`

**Operador**:
- Usuario: `usuario`
- Contraseña: `user123`

## Base de Datos

### Esquema de Base de Datos

#### Tabla: usuarios
```sql
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    activo BOOLEAN DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: productos
```sql
CREATE TABLE productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria_id INTEGER,
    proveedor_id INTEGER,
    precio_unitario DECIMAL(10,2),
    unidad_medida VARCHAR(20),
    stock_minimo INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT 1,
    blockchain_hash VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias (id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores (id)
);
```

#### Tabla: inventario
```sql
CREATE TABLE inventario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    ubicacion_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 0,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos (id),
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (id),
    UNIQUE(producto_id, ubicacion_id)
);
```

#### Tabla: transacciones
```sql
CREATE TABLE transacciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    ubicacion_id INTEGER NOT NULL,
    tipo_transaccion_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2),
    total DECIMAL(10,2),
    referencia VARCHAR(100),
    observaciones TEXT,
    usuario_id INTEGER NOT NULL,
    blockchain_tx_hash VARCHAR(255),
    blockchain_confirmado BOOLEAN DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos (id),
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (id),
    FOREIGN KEY (tipo_transaccion_id) REFERENCES tipos_transaccion (id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);
```

### Operaciones de Base de Datos

#### Backup de Base de Datos
```bash
# Crear backup
cp backend/database/app.db backup/app_backup_$(date +%Y%m%d_%H%M%S).db

# Restaurar backup
cp backup/app_backup_YYYYMMDD_HHMMSS.db backend/database/app.db
```

#### Consultas Útiles

**Ver inventario actual**:
```sql
SELECT 
    p.codigo,
    p.nombre,
    u.nombre as ubicacion,
    i.cantidad,
    p.stock_minimo,
    CASE WHEN i.cantidad <= p.stock_minimo THEN 'BAJO' ELSE 'OK' END as estado
FROM inventario i
JOIN productos p ON i.producto_id = p.id
JOIN ubicaciones u ON i.ubicacion_id = u.id
ORDER BY p.codigo;
```

**Historial de transacciones**:
```sql
SELECT 
    t.fecha_creacion,
    p.codigo,
    p.nombre,
    tt.nombre as tipo,
    t.cantidad,
    u.nombre as ubicacion,
    usr.username as usuario
FROM transacciones t
JOIN productos p ON t.producto_id = p.id
JOIN tipos_transaccion tt ON t.tipo_transaccion_id = tt.id
JOIN ubicaciones u ON t.ubicacion_id = u.id
JOIN usuarios usr ON t.usuario_id = usr.id
ORDER BY t.fecha_creacion DESC;
```


## Smart Contracts

### Contrato Principal: InventoryContract.sol

El smart contract principal gestiona el registro inmutable de productos y transacciones en la blockchain.

#### Estructuras de Datos

```solidity
struct Product {
    uint256 id;
    string code;
    string name;
    string description;
    uint256 categoryId;
    uint256 supplierId;
    uint256 pricePerUnit;
    uint256 timestamp;
    address creator;
}

struct InventoryTransaction {
    uint256 id;
    uint256 productId;
    uint256 locationId;
    int256 quantity;
    uint256 pricePerUnit;
    string transactionType;
    bool isEntry;
    string referenceNumber;
    uint256 timestamp;
    address creator;
}
```

#### Funciones Principales

**registerProduct**: Registra un nuevo producto en blockchain
```solidity
function registerProduct(
    uint256 _id,
    string memory _code,
    string memory _name,
    string memory _description,
    uint256 _categoryId,
    uint256 _supplierId,
    uint256 _pricePerUnit
) public returns (bool)
```

**recordInventoryTransaction**: Registra una transacción de inventario
```solidity
function recordInventoryTransaction(
    uint256 _id,
    uint256 _productId,
    uint256 _locationId,
    int256 _quantity,
    uint256 _pricePerUnit,
    string memory _transactionType,
    bool _isEntry,
    string memory _referenceNumber
) public returns (bool)
```

#### Eventos

```solidity
event ProductRegistered(uint256 indexed productId, string code, address creator);
event InventoryTransactionRecorded(uint256 indexed transactionId, uint256 indexed productId, int256 quantity);
```

### Despliegue de Contratos

#### Configuración de Truffle

```javascript
// truffle-config.js
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 6721975,
      gasPrice: 20000000000
    }
  },
  compilers: {
    solc: {
      version: "0.8.19"
    }
  }
};
```

#### Script de Migración

```javascript
// migrations/2_deploy_inventory_contract.js
const InventoryContract = artifacts.require("InventoryContract");

module.exports = function (deployer) {
  deployer.deploy(InventoryContract);
};
```

#### Comandos de Despliegue

```bash
# Compilar contratos
npx truffle compile

# Desplegar en red de desarrollo
npx truffle migrate --network development

# Ejecutar pruebas
npx truffle test
```

## API Backend

### Endpoints de Autenticación

#### POST /api/auth/login
Autenticar usuario y obtener token JWT.

**Request**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response**:
```json
{
  "message": "Login exitoso",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@inventario.com",
    "rol": "administrador"
  }
}
```

#### POST /api/auth/register
Registrar nuevo usuario (solo administradores).

**Request**:
```json
{
  "username": "nuevo_usuario",
  "email": "usuario@email.com",
  "password": "password123",
  "rol": "operador"
}
```

### Endpoints de Productos

#### GET /api/products/
Obtener lista de productos con filtros opcionales.

**Query Parameters**:
- `search`: Búsqueda por código o nombre
- `category_id`: Filtrar por categoría
- `active`: Filtrar por estado activo

**Response**:
```json
{
  "products": [
    {
      "id": 1,
      "codigo": "LAPTOP001",
      "nombre": "Laptop Dell Inspiron 15",
      "descripcion": "Laptop Dell Inspiron 15 con procesador Intel i5",
      "categoria_id": 1,
      "proveedor_id": 1,
      "precio_unitario": 899.99,
      "unidad_medida": "pcs",
      "stock_minimo": 5,
      "blockchain_hash": "0x...",
      "fecha_creacion": "2025-01-01T00:00:00"
    }
  ]
}
```

#### POST /api/products/
Crear nuevo producto.

**Request**:
```json
{
  "codigo": "MOUSE002",
  "nombre": "Mouse Inalámbrico",
  "descripcion": "Mouse inalámbrico ergonómico",
  "categoria_id": 1,
  "proveedor_id": 1,
  "precio_unitario": 49.99,
  "unidad_medida": "pcs",
  "stock_minimo": 10
}
```

#### PUT /api/products/{id}
Actualizar producto existente.

#### DELETE /api/products/{id}
Eliminar producto (marcado como inactivo).

### Endpoints de Inventario

#### GET /api/inventory/
Obtener estado actual del inventario.

**Response**:
```json
{
  "inventory": [
    {
      "producto_id": 1,
      "producto_codigo": "LAPTOP001",
      "producto_nombre": "Laptop Dell Inspiron 15",
      "ubicacion_id": 1,
      "ubicacion_nombre": "Almacén Principal",
      "cantidad": 10,
      "stock_minimo": 5,
      "estado": "OK"
    }
  ]
}
```

#### GET /api/inventory/low-stock
Obtener productos con stock bajo.

#### GET /api/inventory/by-location/{location_id}
Obtener inventario por ubicación específica.

### Endpoints de Transacciones

#### GET /api/transactions/
Obtener historial de transacciones.

**Query Parameters**:
- `start_date`: Fecha inicio (YYYY-MM-DD)
- `end_date`: Fecha fin (YYYY-MM-DD)
- `product_id`: Filtrar por producto
- `location_id`: Filtrar por ubicación
- `transaction_type`: Filtrar por tipo

#### POST /api/transactions/
Crear nueva transacción de inventario.

**Request**:
```json
{
  "producto_id": 1,
  "ubicacion_id": 1,
  "tipo_transaccion_id": 1,
  "cantidad": 5,
  "precio_unitario": 899.99,
  "referencia": "COMPRA-001",
  "observaciones": "Compra mensual"
}
```

### Endpoints de Blockchain

#### GET /api/blockchain/products/{product_id}
Obtener información de producto desde blockchain.

#### GET /api/blockchain/transactions/{transaction_id}
Obtener información de transacción desde blockchain.

#### GET /api/blockchain/network-info
Obtener información de la red blockchain.

**Response**:
```json
{
  "network": {
    "connected": true,
    "chain_id": 1337,
    "block_number": 150,
    "gas_price": "20000000000"
  },
  "contract_stats": {
    "products_count": 5,
    "transactions_count": 25,
    "contract_address": "0x..."
  }
}
```

### Códigos de Estado HTTP

- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Datos de entrada inválidos
- `401 Unauthorized`: Token JWT inválido o faltante
- `403 Forbidden`: Permisos insuficientes
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto de datos (ej: código duplicado)
- `500 Internal Server Error`: Error interno del servidor

### Autenticación JWT

Todos los endpoints (excepto login) requieren autenticación JWT.

**Header requerido**:
```
Authorization: Bearer <token_jwt>
```

**Estructura del token**:
```json
{
  "sub": "1",
  "username": "admin",
  "rol": "administrador",
  "iat": 1640995200,
  "exp": 1641081600
}
```


## Frontend

### Arquitectura del Frontend

El frontend está construido con React 18 y utiliza un patrón de componentes funcionales con hooks.

#### Estructura de Directorios

```
frontend/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Dashboard.jsx    # Panel principal
│   │   ├── Login.jsx        # Autenticación
│   │   ├── Layout.jsx       # Layout principal
│   │   ├── Products.jsx     # Gestión de productos
│   │   ├── Inventory.jsx    # Control de inventario
│   │   ├── Transactions.jsx # Historial de transacciones
│   │   ├── Locations.jsx    # Gestión de ubicaciones
│   │   ├── Blockchain.jsx   # Información blockchain
│   │   ├── Users.jsx        # Gestión de usuarios
│   │   └── Settings.jsx     # Configuración
│   ├── contexts/            # Contextos React
│   │   └── AuthContext.jsx  # Contexto de autenticación
│   ├── App.jsx             # Componente principal
│   ├── main.jsx            # Punto de entrada
│   └── App.css             # Estilos principales
├── index.html              # HTML principal
├── package.json            # Dependencias
└── vite.config.js          # Configuración de Vite
```

#### Gestión de Estado

**AuthContext**: Maneja el estado de autenticación global
```javascript
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  const login = async (username, password) => {
    // Lógica de login
  };
  
  const logout = () => {
    // Lógica de logout
  };
  
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### Comunicación con API

**Configuración de Fetch**:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};
```

#### Componentes Principales

**Dashboard**: Panel principal con métricas
- Resumen de inventario
- Productos con stock bajo
- Transacciones recientes
- Gráficos de estadísticas

**Products**: Gestión de productos
- Lista de productos con filtros
- Formulario de creación/edición
- Búsqueda y paginación
- Integración con blockchain

**Inventory**: Control de inventario
- Vista por ubicaciones
- Alertas de stock bajo
- Movimientos de inventario
- Reportes de stock

**Transactions**: Historial de transacciones
- Lista filtrable de transacciones
- Detalles de cada movimiento
- Estado de sincronización blockchain
- Exportación de datos

### Estilos y Diseño

**CSS Variables**:
```css
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --background-color: #f8fafc;
  --card-background: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
}
```

**Diseño Responsivo**:
- Mobile-first approach
- Breakpoints: 768px (tablet), 1024px (desktop)
- Grid system flexible
- Componentes adaptables

## Integración Blockchain

### Servicio de Blockchain

El `BlockchainService` maneja toda la comunicación con la blockchain Ethereum.

#### Configuración

```python
class BlockchainService:
    def __init__(self):
        self.blockchain_url = os.getenv('BLOCKCHAIN_URL', 'http://localhost:8545')
        self.contract_address = os.getenv('CONTRACT_ADDRESS')
        self.private_key = os.getenv('PRIVATE_KEY')
        self.w3 = None
        self.contract = None
        self.initialize_connection()
```

#### Métodos Principales

**register_product_on_blockchain**: Registra producto en blockchain
```python
def register_product_on_blockchain(self, product_data):
    try:
        if not self.w3 or not self.w3.is_connected():
            return self._simulate_blockchain_operation('product_registration', product_data)
        
        # Lógica de registro real en blockchain
        tx_hash = self._send_transaction('registerProduct', product_data)
        
        return {
            'success': True,
            'tx_hash': tx_hash,
            'block_number': self.w3.eth.block_number
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}
```

**record_inventory_transaction_on_blockchain**: Registra transacción en blockchain
```python
def record_inventory_transaction_on_blockchain(self, transaction_data):
    # Similar al método anterior pero para transacciones
```

#### Modo Simulación

Cuando la blockchain no está disponible, el sistema opera en modo simulación:

```python
def _simulate_blockchain_operation(self, operation_type, data):
    """Simula operación blockchain cuando no hay conexión"""
    simulated_hash = hashlib.sha256(
        f"{operation_type}_{json.dumps(data)}_{datetime.now().isoformat()}".encode()
    ).hexdigest()
    
    return {
        'success': True,
        'tx_hash': f"0x{simulated_hash}",
        'simulated': True,
        'timestamp': datetime.now().isoformat()
    }
```

### Auditoría Blockchain

Todas las operaciones críticas se registran en la tabla `auditoria_blockchain`:

```python
auditoria = AuditoriaBlockchain(
    tabla_afectada='productos',
    registro_id=producto.id,
    accion='INSERT',
    datos_nuevos=json.dumps(producto.to_dict()),
    blockchain_tx_hash=blockchain_result['tx_hash'],
    bloque_numero=blockchain_result.get('block_number'),
    confirmado=not blockchain_result.get('simulated', False)
)
```

## Seguridad

### Autenticación y Autorización

#### JWT (JSON Web Tokens)
- Tokens con expiración de 24 horas
- Algoritmo HS256 para firma
- Payload incluye ID de usuario, username y rol

#### Cifrado de Contraseñas
- bcrypt con salt automático
- Factor de costo: 12 rounds
- Verificación segura en login

#### Roles de Usuario
- **Administrador**: Acceso completo al sistema
- **Operador**: Acceso limitado a operaciones básicas

### Validación de Datos

#### Backend (Flask)
```python
def validate_product_data(data):
    required_fields = ['codigo', 'nombre']
    for field in required_fields:
        if field not in data or not data[field]:
            raise ValueError(f"Campo requerido: {field}")
    
    if len(data['codigo']) > 50:
        raise ValueError("Código muy largo")
    
    # Más validaciones...
```

#### Frontend (React)
```javascript
const validateProductForm = (formData) => {
  const errors = {};
  
  if (!formData.codigo) {
    errors.codigo = 'Código es requerido';
  }
  
  if (!formData.nombre) {
    errors.nombre = 'Nombre es requerido';
  }
  
  return errors;
};
```

### Protección CORS

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173'])
```

### Sanitización de Datos

- Escape de caracteres especiales en SQL
- Validación de tipos de datos
- Límites de longitud en campos de texto
- Filtrado de caracteres peligrosos

## Mantenimiento

### Logs del Sistema

#### Configuración de Logging
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
```

#### Tipos de Logs
- **INFO**: Operaciones normales
- **WARNING**: Situaciones anómalas no críticas
- **ERROR**: Errores que requieren atención
- **DEBUG**: Información detallada para desarrollo

### Backup y Recuperación

#### Backup Automático
```bash
#!/bin/bash
# Script de backup diario
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_FILE="/path/to/app.db"

# Crear backup de base de datos
cp $DB_FILE $BACKUP_DIR/app_backup_$DATE.db

# Comprimir backup
gzip $BACKUP_DIR/app_backup_$DATE.db

# Eliminar backups antiguos (más de 30 días)
find $BACKUP_DIR -name "app_backup_*.db.gz" -mtime +30 -delete
```

#### Restauración
```bash
# Detener servicios
sudo systemctl stop inventory-backend
sudo systemctl stop inventory-frontend

# Restaurar base de datos
gunzip -c backup/app_backup_YYYYMMDD_HHMMSS.db.gz > backend/database/app.db

# Reiniciar servicios
sudo systemctl start inventory-backend
sudo systemctl start inventory-frontend
```

### Monitoreo

#### Métricas Importantes
- Uso de CPU y memoria
- Espacio en disco
- Tiempo de respuesta de API
- Errores de aplicación
- Estado de conexión blockchain

#### Alertas
- Stock bajo en productos críticos
- Errores de sincronización blockchain
- Fallos de autenticación repetidos
- Uso excesivo de recursos

### Actualizaciones

#### Proceso de Actualización
1. Crear backup completo
2. Detener servicios
3. Actualizar código
4. Ejecutar migraciones de base de datos
5. Probar funcionalidad básica
6. Reiniciar servicios
7. Verificar operación normal

#### Migraciones de Base de Datos
```python
# Ejemplo de migración
def upgrade_database():
    cursor.execute('''
        ALTER TABLE productos 
        ADD COLUMN nueva_columna VARCHAR(100) DEFAULT '';
    ''')
    
    cursor.execute('''
        UPDATE productos 
        SET nueva_columna = 'valor_default' 
        WHERE nueva_columna = '';
    ''')
```

## Solución de Problemas

### Problemas Comunes

#### Error: "Port 5000 is in use"
**Solución**:
```bash
# Encontrar proceso usando el puerto
lsof -i :5000

# Terminar proceso
kill -9 <PID>

# Reiniciar backend
python src/main.py
```

#### Error: "Cannot connect to blockchain"
**Síntomas**: Warning en logs del backend
**Solución**:
1. Verificar que Ganache esté corriendo
2. Comprobar URL de blockchain en .env
3. El sistema funcionará en modo simulación

#### Error: "JWT token expired"
**Síntomas**: Error 401 en frontend
**Solución**:
1. Hacer logout y login nuevamente
2. Verificar configuración de expiración JWT

#### Error: "Database locked"
**Síntomas**: Error al escribir en base de datos
**Solución**:
```bash
# Verificar procesos usando la base de datos
lsof backend/database/app.db

# Reiniciar backend si es necesario
```

### Logs de Depuración

#### Habilitar Debug Mode
```bash
export FLASK_DEBUG=True
export FLASK_ENV=development
```

#### Verificar Logs
```bash
# Logs del backend
tail -f logs/app.log

# Logs del sistema
journalctl -u inventory-backend -f
```

### Contacto de Soporte

Para problemas técnicos o consultas:
- Email: soporte@inventario-blockchain.com
- Documentación: [URL de documentación]
- Issues: [URL de repositorio]/issues

---

**Versión del Manual**: 1.0  
**Fecha de Actualización**: Enero 2025  
**Autor**: Sistema de Inventario Blockchain Team

