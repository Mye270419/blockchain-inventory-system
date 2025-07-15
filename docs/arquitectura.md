# Arquitectura del Sistema de Inventario Blockchain

## Visión General

El sistema de inventario basado en blockchain es una aplicación completa que combina la transparencia y seguridad de la tecnología blockchain con la eficiencia de una base de datos SQL local para gestionar inventarios de manera confiable y auditable.

## Componentes del Sistema

### 1. Smart Contracts (Blockchain)
- **Tecnología**: Solidity + Ethereum/Ganache
- **Función**: Registro inmutable de transacciones de inventario
- **Características**:
  - Registro de productos con hash único
  - Seguimiento de movimientos de inventario
  - Validación de transacciones
  - Eventos para sincronización

### 2. Base de Datos SQL Local
- **Tecnología**: SQLite
- **Función**: Almacenamiento eficiente y consultas rápidas
- **Tablas principales**:
  - `productos`: Información detallada de productos
  - `inventario`: Stock actual y ubicaciones
  - `transacciones`: Historial de movimientos
  - `usuarios`: Gestión de acceso

### 3. Backend API
- **Tecnología**: Flask + Python
- **Función**: Lógica de negocio y coordinación
- **Características**:
  - API REST para operaciones CRUD
  - Integración con smart contracts
  - Sincronización blockchain-SQL
  - Autenticación JWT

### 4. Frontend Web
- **Tecnología**: React + Web3.js
- **Función**: Interfaz de usuario intuitiva
- **Características**:
  - Dashboard de inventario
  - Formularios de gestión
  - Visualización de transacciones blockchain
  - Reportes y estadísticas

## Flujo de Datos

1. **Registro de Producto**:
   - Usuario crea producto en frontend
   - Backend valida y guarda en SQL
   - Smart contract registra hash del producto
   - Confirmación a usuario

2. **Movimiento de Inventario**:
   - Usuario registra entrada/salida
   - Backend actualiza SQL
   - Smart contract registra transacción
   - Evento blockchain sincroniza datos

3. **Consulta de Inventario**:
   - Frontend consulta backend
   - Backend consulta SQL para datos rápidos
   - Blockchain para verificación de integridad

## Seguridad

- **Autenticación**: JWT tokens
- **Autorización**: Roles de usuario
- **Integridad**: Hash blockchain
- **Auditabilía**: Registro inmutable

## Escalabilidad

- Base de datos SQL para consultas rápidas
- Blockchain para transacciones críticas
- Cache en memoria para datos frecuentes
- API RESTful para integración externa

