-- Schema de Base de Datos para Sistema de Inventario Blockchain

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'usuario',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_conexion TIMESTAMP
);

-- Tabla de categorías de productos
CREATE TABLE categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de proveedores
CREATE TABLE proveedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(200) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
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
    blockchain_hash VARCHAR(66), -- Hash de la transacción en blockchain
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

-- Tabla de ubicaciones/almacenes
CREATE TABLE ubicaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    direccion TEXT,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de inventario actual
CREATE TABLE inventario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    ubicacion_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 0,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id),
    UNIQUE(producto_id, ubicacion_id)
);

-- Tabla de tipos de transacción
CREATE TABLE tipos_transaccion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    es_entrada BOOLEAN NOT NULL -- TRUE para entradas, FALSE para salidas
);

-- Tabla de transacciones de inventario
CREATE TABLE transacciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    ubicacion_id INTEGER NOT NULL,
    tipo_transaccion_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2),
    total DECIMAL(10,2),
    referencia VARCHAR(100), -- Número de factura, orden, etc.
    observaciones TEXT,
    usuario_id INTEGER NOT NULL,
    blockchain_tx_hash VARCHAR(66), -- Hash de transacción blockchain
    blockchain_confirmado BOOLEAN DEFAULT FALSE,
    fecha_transaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id),
    FOREIGN KEY (tipo_transaccion_id) REFERENCES tipos_transaccion(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de auditoría blockchain
CREATE TABLE auditoria_blockchain (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tabla_afectada VARCHAR(50) NOT NULL,
    registro_id INTEGER NOT NULL,
    accion VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    datos_anteriores TEXT, -- JSON con datos previos
    datos_nuevos TEXT, -- JSON con datos nuevos
    blockchain_tx_hash VARCHAR(66),
    bloque_numero INTEGER,
    confirmado BOOLEAN DEFAULT FALSE,
    fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX idx_productos_codigo ON productos(codigo);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_inventario_producto ON inventario(producto_id);
CREATE INDEX idx_inventario_ubicacion ON inventario(ubicacion_id);
CREATE INDEX idx_transacciones_producto ON transacciones(producto_id);
CREATE INDEX idx_transacciones_fecha ON transacciones(fecha_transaccion);
CREATE INDEX idx_transacciones_usuario ON transacciones(usuario_id);
CREATE INDEX idx_auditoria_tabla_registro ON auditoria_blockchain(tabla_afectada, registro_id);

-- Datos iniciales
INSERT INTO tipos_transaccion (nombre, descripcion, es_entrada) VALUES
('Compra', 'Entrada de productos por compra', TRUE),
('Venta', 'Salida de productos por venta', FALSE),
('Ajuste Positivo', 'Ajuste de inventario - incremento', TRUE),
('Ajuste Negativo', 'Ajuste de inventario - decremento', FALSE),
('Transferencia Entrada', 'Entrada por transferencia entre ubicaciones', TRUE),
('Transferencia Salida', 'Salida por transferencia entre ubicaciones', FALSE),
('Devolución Cliente', 'Entrada por devolución de cliente', TRUE),
('Devolución Proveedor', 'Salida por devolución a proveedor', FALSE);

INSERT INTO categorias (nombre, descripcion) VALUES
('Electrónicos', 'Productos electrónicos y tecnológicos'),
('Oficina', 'Suministros y equipos de oficina'),
('Herramientas', 'Herramientas y equipos de trabajo'),
('Consumibles', 'Productos de consumo regular');

INSERT INTO ubicaciones (nombre, descripcion) VALUES
('Almacén Principal', 'Almacén central de la empresa'),
('Tienda', 'Área de ventas al público'),
('Depósito Temporal', 'Área temporal para productos en tránsito');

-- Usuario administrador por defecto (password: admin123)
INSERT INTO usuarios (username, email, password_hash, rol) VALUES
('admin', 'admin@empresa.com', 'pbkdf2:sha256:260000$salt$hash', 'administrador');

