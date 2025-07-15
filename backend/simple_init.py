#!/usr/bin/env python3
"""
Script simple para inicializar datos de prueba
"""

import sqlite3
import bcrypt
from datetime import datetime

def init_simple_database():
    """Inicializar base de datos SQLite directamente"""
    
    # Conectar a la base de datos
    conn = sqlite3.connect('database/app.db')
    cursor = conn.cursor()
    
    # Crear tablas básicas
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(80) UNIQUE NOT NULL,
            email VARCHAR(120) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            rol VARCHAR(50) NOT NULL,
            activo BOOLEAN DEFAULT 1,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categorias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre VARCHAR(100) NOT NULL,
            descripcion TEXT,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS proveedores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre VARCHAR(200) NOT NULL,
            contacto VARCHAR(100),
            telefono VARCHAR(20),
            email VARCHAR(120),
            direccion TEXT,
            activo BOOLEAN DEFAULT 1,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ubicaciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre VARCHAR(100) NOT NULL,
            descripcion TEXT,
            direccion TEXT,
            activa BOOLEAN DEFAULT 1,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tipos_transaccion (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre VARCHAR(100) NOT NULL,
            descripcion TEXT,
            es_entrada BOOLEAN NOT NULL,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS productos (
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
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inventario (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            producto_id INTEGER NOT NULL,
            ubicacion_id INTEGER NOT NULL,
            cantidad INTEGER NOT NULL DEFAULT 0,
            fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (producto_id) REFERENCES productos (id),
            FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (id),
            UNIQUE(producto_id, ubicacion_id)
        )
    ''')
    
    # Verificar si ya hay datos
    cursor.execute("SELECT COUNT(*) FROM usuarios")
    if cursor.fetchone()[0] > 0:
        print("La base de datos ya contiene datos.")
        conn.close()
        return
    
    print("Inicializando base de datos con datos de prueba...")
    
    # Insertar usuarios
    admin_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user_password = bcrypt.hashpw('user123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    cursor.execute('''
        INSERT INTO usuarios (username, email, password_hash, rol)
        VALUES (?, ?, ?, ?)
    ''', ('admin', 'admin@inventario.com', admin_password, 'administrador'))
    
    cursor.execute('''
        INSERT INTO usuarios (username, email, password_hash, rol)
        VALUES (?, ?, ?, ?)
    ''', ('usuario', 'usuario@inventario.com', user_password, 'operador'))
    
    # Insertar categorías
    categorias = [
        ('Electrónicos', 'Productos electrónicos'),
        ('Oficina', 'Suministros de oficina'),
        ('Herramientas', 'Herramientas y equipos'),
        ('Consumibles', 'Productos consumibles')
    ]
    
    cursor.executemany('''
        INSERT INTO categorias (nombre, descripcion)
        VALUES (?, ?)
    ''', categorias)
    
    # Insertar proveedores
    proveedores = [
        ('TechSupply Corp', 'Juan Pérez', '+1-555-0123', 'contacto@techsupply.com', '123 Tech Street, Ciudad'),
        ('Office Solutions', 'María García', '+1-555-0456', 'ventas@officesolutions.com', '456 Office Ave, Ciudad'),
        ('Industrial Tools Inc', 'Carlos López', '+1-555-0789', 'info@industrialtools.com', '789 Industrial Blvd, Ciudad')
    ]
    
    cursor.executemany('''
        INSERT INTO proveedores (nombre, contacto, telefono, email, direccion)
        VALUES (?, ?, ?, ?, ?)
    ''', proveedores)
    
    # Insertar ubicaciones
    ubicaciones = [
        ('Almacén Principal', 'Almacén principal de la empresa', 'Calle Principal 123, Ciudad'),
        ('Almacén Secundario', 'Almacén secundario para overflow', 'Avenida Secundaria 456, Ciudad'),
        ('Oficina Central', 'Inventario de oficina central', 'Torre Empresarial, Piso 10, Ciudad')
    ]
    
    cursor.executemany('''
        INSERT INTO ubicaciones (nombre, descripcion, direccion)
        VALUES (?, ?, ?)
    ''', ubicaciones)
    
    # Insertar tipos de transacción
    tipos_transaccion = [
        ('Compra', 'Entrada por compra', 1),
        ('Venta', 'Salida por venta', 0),
        ('Ajuste Positivo', 'Ajuste de inventario positivo', 1),
        ('Ajuste Negativo', 'Ajuste de inventario negativo', 0),
        ('Transferencia Entrada', 'Entrada por transferencia', 1),
        ('Transferencia Salida', 'Salida por transferencia', 0),
        ('Devolución', 'Entrada por devolución', 1),
        ('Merma', 'Salida por merma o daño', 0)
    ]
    
    cursor.executemany('''
        INSERT INTO tipos_transaccion (nombre, descripcion, es_entrada)
        VALUES (?, ?, ?)
    ''', tipos_transaccion)
    
    # Insertar productos
    productos = [
        ('LAPTOP001', 'Laptop Dell Inspiron 15', 'Laptop Dell Inspiron 15 con procesador Intel i5', 1, 1, 899.99, 'pcs', 5),
        ('MOUSE001', 'Mouse Inalámbrico Logitech', 'Mouse inalámbrico Logitech MX Master 3', 1, 1, 99.99, 'pcs', 10),
        ('PAPEL001', 'Papel Bond A4', 'Resma de papel bond A4 75g', 2, 2, 4.99, 'resma', 20),
        ('TALADRO001', 'Taladro Eléctrico Bosch', 'Taladro eléctrico Bosch Professional', 3, 3, 149.99, 'pcs', 3),
        ('TINTA001', 'Cartucho de Tinta HP Negro', 'Cartucho de tinta HP 664 negro', 4, 1, 29.99, 'pcs', 15)
    ]
    
    cursor.executemany('''
        INSERT INTO productos (codigo, nombre, descripcion, categoria_id, proveedor_id, precio_unitario, unidad_medida, stock_minimo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', productos)
    
    # Insertar inventario inicial
    inventarios = [
        (1, 1, 10), (2, 1, 25), (3, 1, 50), (4, 1, 8), (5, 1, 30),  # Almacén Principal
        (1, 2, 5), (2, 2, 15), (3, 2, 25),  # Almacén Secundario
        (2, 3, 5), (3, 3, 10), (5, 3, 8)   # Oficina Central
    ]
    
    cursor.executemany('''
        INSERT INTO inventario (producto_id, ubicacion_id, cantidad)
        VALUES (?, ?, ?)
    ''', inventarios)
    
    conn.commit()
    conn.close()
    
    print("✅ Base de datos inicializada exitosamente!")
    print("\n📋 Datos creados:")
    print("   • 2 usuarios")
    print("   • 4 categorías")
    print("   • 3 proveedores")
    print("   • 3 ubicaciones")
    print("   • 8 tipos de transacción")
    print("   • 5 productos")
    print("   • 11 registros de inventario")
    
    print("\n🔐 Credenciales de acceso:")
    print("   Administrador:")
    print("     Usuario: admin")
    print("     Contraseña: admin123")
    print("   Operador:")
    print("     Usuario: usuario")
    print("     Contraseña: user123")

if __name__ == '__main__':
    init_simple_database()

