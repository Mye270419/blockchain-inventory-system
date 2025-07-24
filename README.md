# Sistema de Inventario Blockchain

Un sistema completo de gestión de inventario que integra tecnología blockchain para garantizar la trazabilidad e inmutabilidad de las transacciones.

## 🚀 Características Principales

- **Backend Flask** con API RESTful completa
- **Frontend React** con interfaz moderna y responsiva
- **Smart Contracts** en Solidity para blockchain
- **Base de datos SQLite** con esquema completo
- **Integración blockchain** para inmutabilidad
- **Sistema de autenticación** JWT seguro
- **Dashboard** con métricas en tiempo real
- **Gestión completa** de productos, inventario y transacciones

## 📋 Requisitos del Sistema

- Python 3.11+
- Node.js 20+
- npm o pnpm
- Git

## 🛠️ Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Mye270419/blockchain-inventory-system.git
cd blockchain-inventory-system
```

### 2. Configurar Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En Linux/macOS:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Crear directorio de base de datos
mkdir -p database

# Inicializar base de datos con datos de prueba
python simple_init.py
```

### 3. Configurar Frontend

```bash
cd ../frontend

# Instalar dependencias
pnpm install
# o si usas npm:
# npm install
```

### 4. Configurar Variables de Entorno

Crear archivo `.env` en la carpeta `backend`:

```env
SECRET_KEY=tu_clave_secreta_aqui
JWT_SECRET_KEY=tu_jwt_secret_aqui
FLASK_ENV=development
```

## 🚀 Ejecución

### Iniciar Backend

```bash
cd backend

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En Linux/macOS:
source venv/bin/activate

# Ejecutar servidor Flask
python run.py
```

El backend estará disponible en: `http://localhost:5000`

### Iniciar Frontend

```bash
cd frontend

# Ejecutar servidor de desarrollo
pnpm run dev --host
# o si usas npm:
# npm run dev -- --host
```

El frontend estará disponible en: `http://localhost:5173`

## 🔐 Credenciales por Defecto

- **Administrador:**
  - Usuario: `admin`
  - Contraseña: `admin123`

- **Operador:**
  - Usuario: `usuario`
  - Contraseña: `user123`

## 🔧 Cambiar Contraseñas

Para cambiar las contraseñas por defecto por razones de seguridad:

```bash
cd backend

# Activar entorno virtual
source venv/bin/activate  # Linux/macOS
# o venv\Scripts\activate  # Windows

# Cambiar contraseñas
python simple_init.py --update-passwords --admin-password nueva_admin_pass --user-password nueva_user_pass
```

## 📁 Estructura del Proyecto

```
blockchain-inventory-system/
├── backend/                 # Servidor Flask
│   ├── src/
│   │   ├── models/         # Modelos de base de datos
│   │   ├── routes/         # Rutas de la API
│   │   ├── services/       # Servicios de negocio
│   │   └── main.py         # Aplicación principal
│   ├── database/           # Base de datos SQLite
│   ├── run.py              # Script de ejecución
│   └── simple_init.py      # Inicialización de datos
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── contexts/       # Contextos de React
│   │   └── App.jsx         # Componente principal
├── contracts/              # Smart contracts Solidity
├── docs/                   # Documentación
└── README.md
```

## 🔗 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### Productos
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `PUT /api/products/{id}` - Actualizar producto
- `DELETE /api/products/{id}` - Eliminar producto

### Inventario
- `GET /api/inventory` - Consultar inventario
- `POST /api/inventory/adjust` - Ajustar inventario

### Transacciones
- `GET /api/transactions` - Listar transacciones
- `POST /api/transactions` - Crear transacción

### Blockchain
- `GET /api/blockchain/status` - Estado de blockchain
- `POST /api/blockchain/verify` - Verificar transacción

## 🛡️ Seguridad

- Autenticación JWT
- Validación de entrada
- Sanitización de datos
- Encriptación de contraseñas con bcrypt
- Auditoría blockchain

## 📚 Documentación Adicional

- [Manual Técnico](docs/manual-tecnico.md)
- [Manual de Usuario](docs/manual-usuario.md)
- [Arquitectura del Sistema](docs/arquitectura.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en el repositorio de GitHub.

---

**Desarrollado con ❤️ usando Flask, React y Blockchain**

