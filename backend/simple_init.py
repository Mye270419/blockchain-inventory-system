import sqlite3
import bcrypt
from datetime import datetime

def init_simple_database(update_existing_passwords=False, admin_new_password=None, user_new_password=None):
    """Inicializar base de datos SQLite directamente o actualizar contraseñas."""
    
    # Conectar a la base de datos
    conn = sqlite3.connect("database/app.db")
    cursor = conn.cursor()
    
    # Crear tablas básicas (si no existen)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(80) UNIQUE NOT NULL,
            email VARCHAR(120) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            rol VARCHAR(50) NOT NULL,
            activo BOOLEAN DEFAULT 1,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS categorias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre VARCHAR(100) NOT NULL,
            descripcion TEXT,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
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
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ubicaciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre VARCHAR(100) NOT NULL,
            descripcion TEXT,
            direccion TEXT,
            activa BOOLEAN DEFAULT 1,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tipos_transaccion (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre VARCHAR(100) NOT NULL,
            descripcion TEXT,
            es_entrada BOOLEAN NOT NULL,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
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
    """)
    
    cursor.execute("""
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
    """)
    
    # Verificar si ya hay datos
    cursor.execute("SELECT COUNT(*) FROM usuarios")
    has_data = cursor.fetchone()[0] > 0

    if not has_data:
        print("Inicializando base de datos con datos de prueba...")
        # Insertar usuarios
        admin_password = bcrypt.hashpw("admin123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        user_password = bcrypt.hashpw("user123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        
        cursor.execute("""
            INSERT INTO usuarios (username, email, password_hash, rol)
            VALUES (?, ?, ?, ?)
        """, ("admin", "admin@inventario.com", admin_password, "administrador"))
        
        cursor.execute("""
            INSERT INTO usuarios (username, email, password_hash, rol)
            VALUES (?, ?, ?, ?)
        """, ("usuario", "usuario@inventario.com", user_password, "operador"))
        
        # Insertar categorías
        categorias = [
            ("Electrónicos", "Productos electrónicos"),
            ("Oficina", "Suministros de oficina"),
            ("Herramientas", "Herramientas y equipos"),
            ("Consumibles", "Productos consumibles")
        ]
        
        cursor.executemany("""
            INSERT INTO categorias (nombre, descripcion)
            VALUES (?, ?)
        """, categorias)
        
        # Insertar proveedores
        proveedores = [
            ("TechSupply Corp", "Juan Pérez", "+1-555-0123", "contacto@techsupply.com", "123 Tech Street, Ciudad"),
            ("Office Solutions", "María García", "+1-555-0456", "ventas@officesolutions.com", "456 Office Ave, Ciudad"),
            ("Industrial Tools Inc", "Carlos López", "+1-555-0789", "info@industrialtools.com", "789 Industrial Blvd, Ciudad")
        ]
        
        cursor.executemany("""
            INSERT INTO proveedores (nombre, contacto, telefono, email, direccion)
            VALUES (?, ?, ?, ?, ?)
        """, proveedores)
        
        # Insertar ubicaciones
        ubicaciones = [
            ("Almacén Principal", "Almacén principal de la empresa", "Calle Principal 123, Ciudad"),
            ("Almacén Secundario", "Almacén secundario para overflow", "Avenida Secundaria 456, Ciudad"),
            ("Oficina Central", "Inventario de oficina central", "Torre Empresarial, Piso 10, Ciudad")
        ]
        
        cursor.executemany("""
            INSERT INTO ubicaciones (nombre, descripcion, direccion)
            VALUES (?, ?, ?)
        """, ubicaciones)
        
        # Insertar tipos de transacción
        tipos_transaccion = [
            ("Compra", "Entrada por compra", 1),
            ("Venta", "Salida por venta", 0),
            ("Ajuste Positivo", "Ajuste de inventario positivo", 1),
            ("Ajuste Negativo", "Ajuste de inventario negativo", 0),
            ("Transferencia Entrada", "Entrada por transferencia", 1),
            ("Transferencia Salida", "Salida por transferencia", 0),
            ("Devolución", "Entrada por devolución", 1),
            ("Merma", "Salida por merma o daño", 0)
        ]
        
        cursor.executemany("""
            INSERT INTO tipos_transaccion (nombre, descripcion, es_entrada)
            VALUES (?, ?, ?)
        """, tipos_transaccion)
        
        # Insertar productos
        productos = [
            ("LAPTOP001", "Laptop Dell Inspiron 15", "Laptop Dell Inspiron 15 con procesador Intel i5", 1, 1, 899.99, "pcs", 5),
            ("MOUSE001", "Mouse Inalámbrico Logitech", "Mouse inalámbrico Logitech MX Master 3", 1, 1, 99.99, "pcs", 10),
            ("PAPEL001", "Papel Bond A4", "Resma de papel bond A4 75g", 2, 2, 4.99, "resma", 20),
            ("TALADRO001", "Taladro Eléctrico Bosch", "Taladro eléctrico Bosch Professional", 3, 3, 149.99, "pcs", 3),
            ("TINTA001", "Cartucho de Tinta HP Negro", "Cartucho de tinta HP 664 negro", 4, 1, 29.99, "pcs", 15)
        ]
        
        cursor.executemany("""
            INSERT INTO productos (codigo, nombre, descripcion, categoria_id, proveedor_id, precio_unitario, unidad_medida, stock_minimo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, productos)
        
        # Insertar inventario inicial
        inventarios = [
            (1, 1, 10), (2, 1, 25), (3, 1, 50), (4, 1, 8), (5, 1, 30),  # Almacén Principal
            (1, 2, 5), (2, 2, 15), (3, 2, 25),  # Almacén Secundario
            (2, 3, 5), (3, 3, 10), (5, 3, 8)   # Oficina Central
        ]
        
        cursor.executemany("""
            INSERT INTO inventario (producto_id, ubicacion_id, cantidad)
            VALUES (?, ?, ?)
        """, inventarios)
        
        conn.commit()
        print("✅ Base de datos inicializada exitosamente!")
        print("\n📋 Datos creados:")
        print("   • 2 usuarios")
        print("   • 4 categorías")
        print("   • 3 proveedores")
        print("   • 3 ubicaciones")
        print("   • 8 tipos de transacción")
        print("   • 5 productos")
        print("   • 11 registros de inventario")
        
        print("\n🔐 Credenciales de acceso iniciales:")
        print("   Administrador:")
        print("     Usuario: admin")
        print("     Contraseña: admin123")
        print("   Operador:")
        print("     Usuario: usuario")
        print("     Contraseña: user123")

    # La lógica de actualización de contraseñas se ejecuta independientemente de si hay datos iniciales
    if update_existing_passwords:
        print("\nActualizando contraseñas de usuarios existentes...")
        
        # Actualizar contraseña de admin
        cursor.execute("SELECT id FROM usuarios WHERE username = ?", ("admin",))
        admin_id = cursor.fetchone()
        if admin_id:
            if admin_new_password:
                new_admin_password = admin_new_password
            else:
                new_admin_password = input("Ingrese la NUEVA contraseña para \'admin\': ")
            hashed_password = bcrypt.hashpw(new_admin_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            cursor.execute("UPDATE usuarios SET password_hash = ? WHERE id = ?", (hashed_password, admin_id[0]))
            print("Contraseña de \'admin\' actualizada.")
        else:
            print("Usuario \'admin\' no encontrado para actualizar.")

        # Actualizar contraseña de usuario
        cursor.execute("SELECT id FROM usuarios WHERE username = ?", ("usuario",))
        user_id = cursor.fetchone()
        if user_id:
            if user_new_password:
                new_normal_password = user_new_password
            else:
                new_normal_password = input("Ingrese la NUEVA contraseña para \'usuario\': ")
            hashed_password = bcrypt.hashpw(new_normal_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            cursor.execute("UPDATE usuarios SET password_hash = ? WHERE id = ?", (hashed_password, user_id[0]))
            print("Contraseña de \'usuario\' actualizada.")
        else:
            print("Usuario \'usuario\' no encontrado para actualizar.")
        
        conn.commit()
        print("✅ Contraseñas actualizadas y cambios guardados en la base de datos.")

    conn.close()

if __name__ == "__main__":
    import sys
    admin_pass = None
    user_pass = None
    update_flag = False

    if "--update-passwords" in sys.argv:
        update_flag = True
        try:
            admin_pass_index = sys.argv.index("--admin-password")
            admin_pass = sys.argv[admin_pass_index + 1]
        except (ValueError, IndexError):
            pass # Se pedirá interactivamente si no se proporciona
        
        try:
            user_pass_index = sys.argv.index("--user-password")
            user_pass = sys.argv[user_pass_index + 1]
        except (ValueError, IndexError):
            pass # Se pedirá interactivamente si no se proporciona

    init_simple_database(update_existing_passwords=update_flag, admin_new_password=admin_pass, user_new_password=user_pass)


