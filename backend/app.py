from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import json
import sqlite3
import os
from datetime import datetime, timedelta
import uuid

app = Flask(__name__)
CORS(app)  # Permitir solicitudes CORS desde cualquier origen

# Configuración JWT
app.config['JWT_SECRET_KEY'] = 'tu-clave-secreta-super-segura-blockchain-inventory'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
jwt = JWTManager(app)

# Configuración de base de datos
DATABASE_PATH = 'database/app.db'

def init_database():
    """Inicializar la base de datos con las tablas necesarias"""
    if not os.path.exists('database'):
        os.makedirs('database')
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Tabla de usuarios con roles
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(80) UNIQUE NOT NULL,
            email VARCHAR(120) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            rol VARCHAR(50) NOT NULL DEFAULT 'cliente',
            nombre VARCHAR(100),
            telefono VARCHAR(20),
            direccion TEXT,
            activo BOOLEAN DEFAULT 1,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabla de categorías
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categorias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre VARCHAR(100) NOT NULL,
            descripcion TEXT,
            activo BOOLEAN DEFAULT 1,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabla de productos expandida para e-commerce
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo VARCHAR(50) UNIQUE NOT NULL,
            nombre VARCHAR(200) NOT NULL,
            descripcion TEXT,
            categoria_id INTEGER,
            precio_unitario DECIMAL(10,2) NOT NULL,
            precio_venta DECIMAL(10,2),
            unidad_medida VARCHAR(20) DEFAULT 'pcs',
            stock_minimo INTEGER DEFAULT 0,
            imagen_url TEXT,
            activo BOOLEAN DEFAULT 1,
            disponible_venta BOOLEAN DEFAULT 1,
            blockchain_hash VARCHAR(255),
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (categoria_id) REFERENCES categorias (id)
        )
    ''')
    
    # Tabla de ubicaciones/almacenes
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ubicaciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre VARCHAR(100) NOT NULL,
            descripcion TEXT,
            direccion TEXT,
            activo BOOLEAN DEFAULT 1,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabla de inventario
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
    
    # Tabla de tipos de transacción
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tipos_transaccion (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre VARCHAR(50) NOT NULL,
            tipo VARCHAR(20) NOT NULL,
            descripcion TEXT,
            activo BOOLEAN DEFAULT 1
        )
    ''')
    
    # Tabla de transacciones de inventario
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transacciones (
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
        )
    ''')
    
    # Tabla de pedidos/órdenes (para e-commerce)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero_pedido VARCHAR(50) UNIQUE NOT NULL,
            cliente_id INTEGER NOT NULL,
            estado VARCHAR(50) DEFAULT 'pendiente',
            subtotal DECIMAL(10,2) NOT NULL,
            impuestos DECIMAL(10,2) DEFAULT 0,
            total DECIMAL(10,2) NOT NULL,
            direccion_entrega TEXT,
            telefono_contacto VARCHAR(20),
            observaciones TEXT,
            fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_entrega TIMESTAMP,
            FOREIGN KEY (cliente_id) REFERENCES usuarios (id)
        )
    ''')
    
    # Tabla de detalles de pedidos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS detalle_pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pedido_id INTEGER NOT NULL,
            producto_id INTEGER NOT NULL,
            cantidad INTEGER NOT NULL,
            precio_unitario DECIMAL(10,2) NOT NULL,
            subtotal DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (pedido_id) REFERENCES pedidos (id),
            FOREIGN KEY (producto_id) REFERENCES productos (id)
        )
    ''')
    
    # Tabla de pagos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pagos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pedido_id INTEGER NOT NULL,
            metodo_pago VARCHAR(50) NOT NULL,
            monto DECIMAL(10,2) NOT NULL,
            estado VARCHAR(50) DEFAULT 'pendiente',
            referencia_pago VARCHAR(100),
            qr_code TEXT,
            fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (pedido_id) REFERENCES pedidos (id)
        )
    ''')
    
    conn.commit()
    conn.close()

def insert_initial_data():
    """Insertar datos iniciales"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Verificar si ya existen datos
    cursor.execute('SELECT COUNT(*) FROM usuarios')
    if cursor.fetchone()[0] > 0:
        conn.close()
        return
    
    # Usuarios iniciales
    admin_password = generate_password_hash('admin123')
    employee_password = generate_password_hash('empleado123')
    client_password = generate_password_hash('cliente123')
    
    cursor.execute('''
        INSERT INTO usuarios (username, email, password_hash, rol, nombre)
        VALUES 
        ('admin', 'admin@inventario.com', ?, 'administrador', 'Administrador Sistema'),
        ('empleado', 'empleado@inventario.com', ?, 'empleado', 'Empleado Inventario'),
        ('cliente', 'cliente@inventario.com', ?, 'cliente', 'Cliente Demo')
    ''', (admin_password, employee_password, client_password))
    
    # Categorías iniciales
    cursor.execute('''
        INSERT INTO categorias (nombre, descripcion)
        VALUES 
        ('Computadoras', 'Equipos de cómputo y accesorios'),
        ('Muebles', 'Mobiliario para oficina y hogar'),
        ('Comidas', 'Alimentos y bebidas'),
        ('Electrónicos', 'Dispositivos electrónicos diversos')
    ''')
    
    # Ubicaciones iniciales
    cursor.execute('''
        INSERT INTO ubicaciones (nombre, descripcion, direccion)
        VALUES 
        ('Almacén Principal', 'Almacén central de inventario', 'Av. Principal 123'),
        ('Tienda Centro', 'Tienda en el centro de la ciudad', 'Calle Central 456'),
        ('Almacén Secundario', 'Almacén de respaldo', 'Zona Industrial 789')
    ''')
    
    # Tipos de transacción
    cursor.execute('''
        INSERT INTO tipos_transaccion (nombre, tipo, descripcion)
        VALUES 
        ('Compra', 'entrada', 'Compra a proveedores'),
        ('Venta', 'salida', 'Venta a clientes'),
        ('Ajuste Positivo', 'entrada', 'Ajuste de inventario hacia arriba'),
        ('Ajuste Negativo', 'salida', 'Ajuste de inventario hacia abajo'),
        ('Transferencia Entrada', 'entrada', 'Recepción desde otra ubicación'),
        ('Transferencia Salida', 'salida', 'Envío a otra ubicación'),
        ('Devolución Cliente', 'entrada', 'Productos devueltos por clientes'),
        ('Merma', 'salida', 'Productos dañados o perdidos')
    ''')
    
    # Productos iniciales
    productos_iniciales = [
        ('LAPTOP001', 'Laptop Dell Inspiron 15', 'Laptop Dell Inspiron 15 con procesador Intel i5, 8GB RAM, 256GB SSD', 1, 899.99, 1199.99, 'pcs', 5, 'https://example.com/laptop.jpg'),
        ('MOUSE001', 'Mouse Inalámbrico Logitech', 'Mouse inalámbrico ergonómico con sensor óptico', 1, 29.99, 49.99, 'pcs', 20, 'https://example.com/mouse.jpg'),
        ('DESK001', 'Escritorio de Oficina', 'Escritorio de madera con cajones', 2, 199.99, 299.99, 'pcs', 3, 'https://example.com/desk.jpg'),
        ('CHAIR001', 'Silla Ergonómica', 'Silla de oficina con soporte lumbar', 2, 149.99, 249.99, 'pcs', 5, 'https://example.com/chair.jpg'),
        ('PIZZA001', 'Pizza Margherita', 'Pizza italiana con tomate, mozzarella y albahaca', 3, 8.99, 15.99, 'pcs', 0, 'https://example.com/pizza.jpg'),
        ('BURGER001', 'Hamburguesa Clásica', 'Hamburguesa con carne, lechuga, tomate y queso', 3, 6.99, 12.99, 'pcs', 0, 'https://example.com/burger.jpg'),
        ('PHONE001', 'Smartphone Samsung', 'Smartphone con pantalla de 6.5 pulgadas', 4, 399.99, 599.99, 'pcs', 10, 'https://example.com/phone.jpg'),
        ('TABLET001', 'Tablet iPad', 'Tablet con pantalla de 10.9 pulgadas', 4, 299.99, 449.99, 'pcs', 8, 'https://example.com/tablet.jpg')
    ]
    
    for producto in productos_iniciales:
        cursor.execute('''
            INSERT INTO productos (codigo, nombre, descripcion, categoria_id, precio_unitario, precio_venta, unidad_medida, stock_minimo, imagen_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', producto)
    
    # Inventario inicial
    inventario_inicial = [
        (1, 1, 15),  # Laptop en Almacén Principal
        (2, 1, 50),  # Mouse en Almacén Principal
        (3, 1, 8),   # Escritorio en Almacén Principal
        (4, 1, 12),  # Silla en Almacén Principal
        (5, 2, 25),  # Pizza en Tienda Centro
        (6, 2, 30),  # Burger en Tienda Centro
        (7, 1, 20),  # Smartphone en Almacén Principal
        (8, 1, 15),  # Tablet en Almacén Principal
    ]
    
    for inv in inventario_inicial:
        cursor.execute('''
            INSERT INTO inventario (producto_id, ubicacion_id, cantidad)
            VALUES (?, ?, ?)
        ''', inv)
    
    conn.commit()
    conn.close()

# Inicializar base de datos al iniciar la aplicación
init_database()
insert_initial_data()

# Rutas de autenticación
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username y password son requeridos'}), 400
        
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, username, email, password_hash, rol, nombre, activo
            FROM usuarios 
            WHERE username = ? AND activo = 1
        ''', (username,))
        
        user = cursor.fetchone()
        conn.close()
        
        if user and check_password_hash(user['password_hash'], password):
            access_token = create_access_token(identity=user['id'])
            
            return jsonify({
                'message': 'Login exitoso',
                'access_token': access_token,
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'rol': user['rol'],
                    'nombre': user['nombre']
                }
            }), 200
        else:
            return jsonify({'error': 'Credenciales inválidas'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        rol = data.get('rol', 'cliente')
        nombre = data.get('nombre', '')
        telefono = data.get('telefono', '')
        direccion = data.get('direccion', '')
        
        if not username or not email or not password:
            return jsonify({'error': 'Username, email y password son requeridos'}), 400
        
        password_hash = generate_password_hash(password)
        
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO usuarios (username, email, password_hash, rol, nombre, telefono, direccion)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (username, email, password_hash, rol, nombre, telefono, direccion))
            
            conn.commit()
            conn.close()
            
            return jsonify({'message': 'Usuario registrado exitosamente'}), 201
            
        except sqlite3.IntegrityError as e:
            conn.close()
            if 'username' in str(e):
                return jsonify({'error': 'El nombre de usuario ya existe'}), 400
            elif 'email' in str(e):
                return jsonify({'error': 'El email ya está registrado'}), 400
            else:
                return jsonify({'error': 'Error de integridad de datos'}), 400
                
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, username, email, rol, nombre, telefono, direccion, fecha_creacion
            FROM usuarios 
            WHERE id = ? AND activo = 1
        ''', (user_id,))
        
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return jsonify({
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'rol': user['rol'],
                    'nombre': user['nombre'],
                    'telefono': user['telefono'],
                    'direccion': user['direccion'],
                    'fecha_creacion': user['fecha_creacion']
                }
            }), 200
        else:
            return jsonify({'error': 'Usuario no encontrado'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Continúa en el siguiente mensaje...


# Rutas de productos
@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        search = request.args.get('search', '')
        category_id = request.args.get('category_id', '')
        available_only = request.args.get('available_only', 'false').lower() == 'true'
        
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        query = '''
            SELECT p.*, c.nombre as categoria_nombre,
                   COALESCE(SUM(i.cantidad), 0) as stock_total
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN inventario i ON p.id = i.producto_id
            WHERE p.activo = 1
        '''
        params = []
        
        if search:
            query += ' AND (p.codigo LIKE ? OR p.nombre LIKE ? OR p.descripcion LIKE ?)'
            search_param = f'%{search}%'
            params.extend([search_param, search_param, search_param])
        
        if category_id:
            query += ' AND p.categoria_id = ?'
            params.append(category_id)
        
        if available_only:
            query += ' AND p.disponible_venta = 1'
        
        query += ' GROUP BY p.id ORDER BY p.nombre'
        
        cursor.execute(query, params)
        products = cursor.fetchall()
        conn.close()
        
        products_list = []
        for product in products:
            products_list.append({
                'id': product['id'],
                'codigo': product['codigo'],
                'nombre': product['nombre'],
                'descripcion': product['descripcion'],
                'categoria_id': product['categoria_id'],
                'categoria_nombre': product['categoria_nombre'],
                'precio_unitario': product['precio_unitario'],
                'precio_venta': product['precio_venta'],
                'unidad_medida': product['unidad_medida'],
                'stock_minimo': product['stock_minimo'],
                'stock_total': product['stock_total'],
                'imagen_url': product['imagen_url'],
                'disponible_venta': product['disponible_venta'],
                'fecha_creacion': product['fecha_creacion']
            })
        
        return jsonify({'products': products_list}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT p.*, c.nombre as categoria_nombre,
                   COALESCE(SUM(i.cantidad), 0) as stock_total
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN inventario i ON p.id = i.producto_id
            WHERE p.id = ? AND p.activo = 1
            GROUP BY p.id
        ''', (product_id,))
        
        product = cursor.fetchone()
        conn.close()
        
        if product:
            return jsonify({
                'product': {
                    'id': product['id'],
                    'codigo': product['codigo'],
                    'nombre': product['nombre'],
                    'descripcion': product['descripcion'],
                    'categoria_id': product['categoria_id'],
                    'categoria_nombre': product['categoria_nombre'],
                    'precio_unitario': product['precio_unitario'],
                    'precio_venta': product['precio_venta'],
                    'unidad_medida': product['unidad_medida'],
                    'stock_minimo': product['stock_minimo'],
                    'stock_total': product['stock_total'],
                    'imagen_url': product['imagen_url'],
                    'disponible_venta': product['disponible_venta'],
                    'fecha_creacion': product['fecha_creacion']
                }
            }), 200
        else:
            return jsonify({'error': 'Producto no encontrado'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products', methods=['POST'])
@jwt_required()
def create_product():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Verificar que el usuario sea administrador o empleado
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('SELECT rol FROM usuarios WHERE id = ?', (user_id,))
        user_role = cursor.fetchone()
        
        if not user_role or user_role[0] not in ['administrador', 'empleado']:
            conn.close()
            return jsonify({'error': 'Permisos insuficientes'}), 403
        
        # Crear producto
        cursor.execute('''
            INSERT INTO productos (codigo, nombre, descripcion, categoria_id, precio_unitario, precio_venta, unidad_medida, stock_minimo, imagen_url, disponible_venta)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('codigo'),
            data.get('nombre'),
            data.get('descripcion', ''),
            data.get('categoria_id'),
            data.get('precio_unitario'),
            data.get('precio_venta', data.get('precio_unitario')),
            data.get('unidad_medida', 'pcs'),
            data.get('stock_minimo', 0),
            data.get('imagen_url', ''),
            data.get('disponible_venta', True)
        ))
        
        product_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Producto creado exitosamente',
            'product_id': product_id
        }), 201
        
    except sqlite3.IntegrityError:
        return jsonify({'error': 'El código del producto ya existe'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Rutas de inventario
@app.route('/api/inventory/summary', methods=['GET'])
def get_inventory_summary():
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Resumen general
        cursor.execute('SELECT COUNT(*) as total FROM productos WHERE activo = 1')
        total_productos = cursor.fetchone()['total']
        
        cursor.execute('SELECT COUNT(*) as total FROM ubicaciones WHERE activo = 1')
        total_ubicaciones = cursor.fetchone()['total']
        
        cursor.execute('''
            SELECT COALESCE(SUM(p.precio_venta * i.cantidad), 0) as valor_total
            FROM inventario i
            JOIN productos p ON i.producto_id = p.id
            WHERE p.activo = 1
        ''')
        valor_total = cursor.fetchone()['valor_total']
        
        # Productos con stock bajo
        cursor.execute('''
            SELECT COUNT(*) as bajo_stock
            FROM (
                SELECT p.id, COALESCE(SUM(i.cantidad), 0) as stock_total
                FROM productos p
                LEFT JOIN inventario i ON p.id = i.producto_id
                WHERE p.activo = 1
                GROUP BY p.id
                HAVING stock_total <= p.stock_minimo AND p.stock_minimo > 0
            )
        ''')
        productos_bajo_stock = cursor.fetchone()['bajo_stock']
        
        # Top productos
        cursor.execute('''
            SELECT p.id, p.codigo, p.nombre, p.precio_venta, COALESCE(SUM(i.cantidad), 0) as stock_total
            FROM productos p
            LEFT JOIN inventario i ON p.id = i.producto_id
            WHERE p.activo = 1
            GROUP BY p.id
            ORDER BY stock_total DESC
            LIMIT 5
        ''')
        top_productos = cursor.fetchall()
        
        conn.close()
        
        return jsonify({
            'summary': {
                'total_productos': total_productos,
                'total_ubicaciones': total_ubicaciones,
                'valor_total': float(valor_total) if valor_total else 0,
                'productos_bajo_stock': productos_bajo_stock,
                'alertas_stock': []
            },
            'top_productos': [dict(row) for row in top_productos]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/inventory/locations', methods=['GET'])
def get_locations():
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, nombre, descripcion, direccion, fecha_creacion
            FROM ubicaciones 
            WHERE activo = 1
            ORDER BY nombre
        ''')
        
        locations = cursor.fetchall()
        conn.close()
        
        return jsonify({
            'locations': [dict(row) for row in locations]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Rutas de transacciones
@app.route('/api/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT t.*, p.codigo as producto_codigo, p.nombre as producto_nombre,
                   u.nombre as ubicacion_nombre, tt.nombre as tipo_nombre,
                   usr.username as usuario_nombre
            FROM transacciones t
            JOIN productos p ON t.producto_id = p.id
            JOIN ubicaciones u ON t.ubicacion_id = u.id
            JOIN tipos_transaccion tt ON t.tipo_transaccion_id = tt.id
            JOIN usuarios usr ON t.usuario_id = usr.id
            ORDER BY t.fecha_creacion DESC
            LIMIT 50
        ''')
        
        transactions = cursor.fetchall()
        conn.close()
        
        return jsonify({
            'transactions': [dict(row) for row in transactions]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions', methods=['POST'])
@jwt_required()
def create_transaction():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Crear transacción
        cursor.execute('''
            INSERT INTO transacciones (producto_id, ubicacion_id, tipo_transaccion_id, cantidad, precio_unitario, total, referencia, observaciones, usuario_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('producto_id'),
            data.get('ubicacion_id'),
            data.get('tipo_transaccion_id'),
            data.get('cantidad'),
            data.get('precio_unitario'),
            data.get('total', data.get('precio_unitario', 0) * data.get('cantidad', 0)),
            data.get('referencia', ''),
            data.get('observaciones', ''),
            user_id
        ))
        
        transaction_id = cursor.lastrowid
        
        # Actualizar inventario
        # Obtener tipo de transacción
        cursor.execute('SELECT tipo FROM tipos_transaccion WHERE id = ?', (data.get('tipo_transaccion_id'),))
        tipo_result = cursor.fetchone()
        
        if tipo_result:
            tipo = tipo_result[0]
            cantidad_cambio = data.get('cantidad') if tipo == 'entrada' else -data.get('cantidad')
            
            # Verificar si existe registro de inventario
            cursor.execute('''
                SELECT cantidad FROM inventario 
                WHERE producto_id = ? AND ubicacion_id = ?
            ''', (data.get('producto_id'), data.get('ubicacion_id')))
            
            existing = cursor.fetchone()
            
            if existing:
                nueva_cantidad = existing[0] + cantidad_cambio
                cursor.execute('''
                    UPDATE inventario 
                    SET cantidad = ?, fecha_actualizacion = CURRENT_TIMESTAMP
                    WHERE producto_id = ? AND ubicacion_id = ?
                ''', (nueva_cantidad, data.get('producto_id'), data.get('ubicacion_id')))
            else:
                cursor.execute('''
                    INSERT INTO inventario (producto_id, ubicacion_id, cantidad)
                    VALUES (?, ?, ?)
                ''', (data.get('producto_id'), data.get('ubicacion_id'), max(0, cantidad_cambio)))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Transacción registrada exitosamente',
            'transaction_id': transaction_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Rutas de categorías
@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, nombre, descripcion, fecha_creacion
            FROM categorias 
            WHERE activo = 1
            ORDER BY nombre
        ''')
        
        categories = cursor.fetchall()
        conn.close()
        
        return jsonify({
            'categories': [dict(row) for row in categories]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Rutas de pedidos (e-commerce)
@app.route('/api/orders', methods=['POST'])
@jwt_required()
def create_order():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Generar número de pedido único
        numero_pedido = f"PED-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        # Crear pedido
        cursor.execute('''
            INSERT INTO pedidos (numero_pedido, cliente_id, subtotal, impuestos, total, direccion_entrega, telefono_contacto, observaciones)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            numero_pedido,
            user_id,
            data.get('subtotal'),
            data.get('impuestos', 0),
            data.get('total'),
            data.get('direccion_entrega', ''),
            data.get('telefono_contacto', ''),
            data.get('observaciones', '')
        ))
        
        pedido_id = cursor.lastrowid
        
        # Crear detalles del pedido
        for item in data.get('items', []):
            cursor.execute('''
                INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                pedido_id,
                item.get('producto_id'),
                item.get('cantidad'),
                item.get('precio_unitario'),
                item.get('subtotal')
            ))
            
            # Actualizar inventario (reducir stock)
            cursor.execute('''
                UPDATE inventario 
                SET cantidad = cantidad - ?, fecha_actualizacion = CURRENT_TIMESTAMP
                WHERE producto_id = ? AND ubicacion_id = 1
            ''', (item.get('cantidad'), item.get('producto_id')))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Pedido creado exitosamente',
            'pedido_id': pedido_id,
            'numero_pedido': numero_pedido
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_orders(user_id):
    try:
        current_user_id = get_jwt_identity()
        
        # Verificar que el usuario solo pueda ver sus propios pedidos (excepto admin/empleado)
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('SELECT rol FROM usuarios WHERE id = ?', (current_user_id,))
        user_role = cursor.fetchone()
        
        if user_role and user_role['rol'] not in ['administrador', 'empleado'] and current_user_id != user_id:
            conn.close()
            return jsonify({'error': 'Permisos insuficientes'}), 403
        
        cursor.execute('''
            SELECT p.*, u.nombre as cliente_nombre
            FROM pedidos p
            JOIN usuarios u ON p.cliente_id = u.id
            WHERE p.cliente_id = ?
            ORDER BY p.fecha_pedido DESC
        ''')
        
        orders = cursor.fetchall()
        conn.close()
        
        return jsonify({
            'orders': [dict(row) for row in orders]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Rutas de pagos
@app.route('/api/payments', methods=['POST'])
@jwt_required()
def create_payment():
    try:
        data = request.get_json()
        
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Generar código QR para pagos QR
        qr_code = None
        if data.get('metodo_pago') == 'qr':
            qr_code = f"QR-{str(uuid.uuid4())[:12].upper()}"
        
        cursor.execute('''
            INSERT INTO pagos (pedido_id, metodo_pago, monto, referencia_pago, qr_code)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data.get('pedido_id'),
            data.get('metodo_pago'),
            data.get('monto'),
            data.get('referencia_pago', ''),
            qr_code
        ))
        
        payment_id = cursor.lastrowid
        
        # Actualizar estado del pedido
        cursor.execute('''
            UPDATE pedidos 
            SET estado = 'pagado'
            WHERE id = ?
        ''', (data.get('pedido_id'),))
        
        conn.commit()
        conn.close()
        
        response_data = {
            'message': 'Pago procesado exitosamente',
            'payment_id': payment_id
        }
        
        if qr_code:
            response_data['qr_code'] = qr_code
        
        return jsonify(response_data), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/payments/methods', methods=['GET'])
def get_payment_methods():
    return jsonify({
        'methods': [
            {'id': 'efectivo', 'nombre': 'Efectivo', 'descripcion': 'Pago en efectivo'},
            {'id': 'tarjeta', 'nombre': 'Tarjeta', 'descripcion': 'Pago con tarjeta de crédito/débito'},
            {'id': 'qr', 'nombre': 'Código QR', 'descripcion': 'Pago mediante código QR'},
            {'id': 'transferencia', 'nombre': 'Transferencia', 'descripcion': 'Transferencia bancaria'}
        ]
    }), 200

# Ruta de información de blockchain (simulada)
@app.route('/api/blockchain/network-info', methods=['GET'])
def get_blockchain_info():
    return jsonify({
        'network': {
            'connected': False,
            'chain_id': 'N/A',
            'block_number': 0,
            'gas_price': '0'
        },
        'contract_stats': {
            'products_count': 0,
            'transactions_count': 0,
            'contract_address': 'N/A'
        },
        'message': 'Blockchain en modo simulado - Los datos se almacenan localmente'
    }), 200

if __name__ == '__main__':
    print("🚀 Iniciando Sistema de Inventario Blockchain")
    print("📊 Dashboard disponible en: http://localhost:5000")
    print("🔗 Blockchain: Modo simulado")
    app.run(host='0.0.0.0', port=5000, debug=True)

