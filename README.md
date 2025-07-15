# Sistema de Inventario Blockchain

Un sistema completo de gestión de inventario que combina tecnología blockchain con bases de datos tradicionales para proporcionar transparencia, trazabilidad e inmutabilidad en el control de inventarios.

## 🚀 Características Principales

- **💼 Gestión Completa de Inventario**: Control total de productos, ubicaciones, proveedores y categorías
- **🔗 Integración Blockchain**: Registro inmutable de todas las transacciones críticas
- **📊 Dashboard Intuitivo**: Panel de control con métricas en tiempo real
- **🔐 Autenticación Segura**: Sistema JWT con roles diferenciados
- **📱 Interfaz Responsiva**: Diseño moderno compatible con dispositivos móviles
- **🔍 Auditoría Completa**: Trazabilidad total de todas las operaciones
- **⚡ Alertas Automáticas**: Notificaciones de stock bajo y eventos importantes
- **📈 Reportes Avanzados**: Generación de reportes detallados y exportación

## 🏗️ Arquitectura del Sistema

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

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Framework de interfaz de usuario
- **Vite** - Herramienta de construcción rápida
- **CSS3** - Estilos modernos y responsivos

### Backend
- **Flask** - Framework web de Python
- **SQLAlchemy** - ORM para base de datos
- **JWT** - Autenticación segura
- **bcrypt** - Cifrado de contraseñas

### Blockchain
- **Solidity** - Lenguaje de smart contracts
- **Web3.py** - Integración con Ethereum
- **Truffle** - Framework de desarrollo blockchain
- **Ganache** - Blockchain local para desarrollo

### Base de Datos
- **SQLite** - Base de datos local eficiente

## 📦 Instalación

### Requisitos Previos

- Python 3.11+
- Node.js 20+
- npm/pnpm
- Git

### Instalación Rápida

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd blockchain-inventory-system
```

2. **Configurar Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
mkdir -p database
python simple_init.py
```

3. **Configurar Frontend**
```bash
cd ../frontend
pnpm install
```

4. **Configurar Blockchain (Opcional)**
```bash
cd ../contracts
npm install
```

## 🚀 Uso

### Iniciar el Sistema

1. **Backend** (Terminal 1):
```bash
cd backend
source venv/bin/activate
python src/main.py
```

2. **Frontend** (Terminal 2):
```bash
cd frontend
pnpm run dev --host
```

3. **Blockchain Local** (Terminal 3 - Opcional):
```bash
cd contracts
npx ganache-cli --deterministic --accounts 10 --host 0.0.0.0
```

### Acceso al Sistema

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Blockchain**: http://localhost:8545

### Credenciales por Defecto

**Administrador**:
- Usuario: `admin`
- Contraseña: `admin123`

**Operador**:
- Usuario: `usuario`
- Contraseña: `user123`

## 📁 Estructura del Proyecto

```
blockchain-inventory-system/
├── backend/                 # Aplicación Flask
│   ├── src/
│   │   ├── main.py         # Aplicación principal
│   │   ├── models/         # Modelos de datos
│   │   ├── routes/         # Endpoints de API
│   │   └── services/       # Servicios de negocio
│   ├── database/           # Base de datos SQLite
│   └── requirements.txt    # Dependencias Python
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── contexts/       # Contextos de estado
│   │   └── App.jsx        # Componente principal
│   └── package.json       # Dependencias Node.js
├── contracts/              # Smart Contracts
│   ├── contracts/         # Archivos .sol
│   ├── migrations/        # Scripts de despliegue
│   └── test/             # Pruebas de contratos
├── docs/                  # Documentación
│   ├── manual-tecnico.md  # Manual técnico completo
│   ├── manual-usuario.md  # Manual de usuario
│   └── arquitectura.md    # Documentación de arquitectura
└── scripts/               # Scripts de utilidad
```

## 📚 Documentación

- **[Manual Técnico](docs/manual-tecnico.md)** - Documentación completa para desarrolladores
- **[Manual de Usuario](docs/manual-usuario.md)** - Guía para usuarios finales
- **[Arquitectura del Sistema](docs/arquitectura.md)** - Diseño y componentes del sistema

## 🔧 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Productos
- `GET /api/products/` - Listar productos
- `POST /api/products/` - Crear producto
- `PUT /api/products/{id}` - Actualizar producto
- `DELETE /api/products/{id}` - Eliminar producto

### Inventario
- `GET /api/inventory/` - Estado del inventario
- `GET /api/inventory/low-stock` - Productos con stock bajo

### Transacciones
- `GET /api/transactions/` - Historial de transacciones
- `POST /api/transactions/` - Registrar transacción

### Blockchain
- `GET /api/blockchain/network-info` - Información de la red
- `GET /api/blockchain/products/{id}` - Producto en blockchain
- `GET /api/blockchain/transactions/{id}` - Transacción en blockchain

## 🔐 Seguridad

- **Autenticación JWT** con tokens de 24 horas
- **Cifrado bcrypt** para contraseñas
- **Validación de datos** en frontend y backend
- **Roles de usuario** (Administrador/Operador)
- **Registro inmutable** en blockchain
- **Auditoría completa** de todas las operaciones

## 🧪 Pruebas

### Backend
```bash
cd backend
source venv/bin/activate
python -m pytest tests/
```

### Smart Contracts
```bash
cd contracts
npx truffle test
```

### Frontend
```bash
cd frontend
pnpm test
```

## 📊 Características del Sistema

### Gestión de Productos
- Catálogo completo con códigos únicos
- Categorización y clasificación
- Información de proveedores
- Control de precios y unidades de medida
- Stock mínimo configurable

### Control de Inventario
- Múltiples ubicaciones/almacenes
- Stock en tiempo real
- Alertas de stock bajo
- Trazabilidad completa
- Valorización de inventario

### Transacciones
- Entradas (compras, devoluciones, ajustes)
- Salidas (ventas, transferencias, mermas)
- Registro automático en blockchain
- Historial inmutable
- Referencias y observaciones

### Reportes
- Inventario actual por ubicación
- Movimientos por período
- Productos con stock bajo
- Valorización de inventario
- Exportación a Excel/PDF

## 🔗 Integración Blockchain

### Funcionalidades
- **Registro de Productos**: Cada producto se registra en blockchain
- **Transacciones Inmutables**: Todas las operaciones críticas se almacenan
- **Verificación de Integridad**: Validación de datos contra blockchain
- **Auditoría Transparente**: Historial público y verificable

### Smart Contracts
- `InventoryContract.sol` - Contrato principal
- Funciones para registro de productos y transacciones
- Eventos para auditoría y notificaciones
- Estructuras de datos optimizadas

### Modo de Operación
- **Conectado**: Registro directo en blockchain
- **Simulado**: Operación local cuando blockchain no está disponible
- **Sincronización**: Automática cuando se restablece la conexión

## 🚀 Despliegue en Producción

### Requisitos del Servidor
- **CPU**: 2+ cores
- **RAM**: 4GB mínimo, 8GB recomendado
- **Almacenamiento**: 10GB+ SSD
- **Red**: Conexión estable a internet

### Variables de Entorno
```env
FLASK_ENV=production
SECRET_KEY=tu-clave-secreta-muy-segura
DATABASE_URL=sqlite:///database/app.db
JWT_SECRET_KEY=tu-jwt-secret-key
BLOCKCHAIN_URL=http://localhost:8545
```

### Servicios Systemd
Configurar servicios para inicio automático del backend y frontend.

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para la característica (`git checkout -b feature/AmazingFeature`)
3. Commit los cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

- **Email**: soporte@inventario-blockchain.com
- **Documentación**: [Manual Técnico](docs/manual-tecnico.md)
- **Issues**: [GitHub Issues](../../issues)

## 🎯 Roadmap

### Versión 1.1
- [ ] Integración con APIs de proveedores
- [ ] Notificaciones por email
- [ ] Reportes avanzados con gráficos
- [ ] Aplicación móvil

### Versión 1.2
- [ ] Integración con códigos de barras/QR
- [ ] Múltiples monedas
- [ ] Workflow de aprobaciones
- [ ] Dashboard ejecutivo

### Versión 2.0
- [ ] Inteligencia artificial para predicción de demanda
- [ ] Integración con ERP externos
- [ ] Blockchain pública (Ethereum mainnet)
- [ ] Marketplace de productos

---

**Desarrollado con ❤️ por el equipo de Sistema de Inventario Blockchain**

*Versión 1.0 - Enero 2025*

