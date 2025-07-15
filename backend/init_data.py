#!/usr/bin/env python3
"""
Script para inicializar datos de prueba en el sistema de inventario blockchain
"""

import sys
import os
from datetime import datetime
import bcrypt

# Agregar el directorio src al path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

# Configurar variables de entorno antes de importar
os.environ['FLASK_ENV'] = 'development'
os.environ['DATABASE_URL'] = 'sqlite:///database/app.db'

from main import app, db
from models.inventory import Usuario, Categoria, Proveedor, Ubicacion, TipoTransaccion, Producto, Inventario

def init_database():
    """Inicializar la base de datos con datos de prueba"""
    with app.app_context():
        # Crear todas las tablas
        db.create_all()
        
        # Verificar si ya hay datos
        if Usuario.query.first():
            print("La base de datos ya contiene datos. Saltando inicialización.")
            return
        
        print("Inicializando base de datos con datos de prueba...")
        
        # Crear usuarios
        admin_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
        user_password = bcrypt.hashpw('user123'.encode('utf-8'), bcrypt.gensalt())
        
        admin = Usuario(
            username='admin',
            email='admin@inventario.com',
            password_hash=admin_password.decode('utf-8'),
            rol='administrador',
            activo=True
        )
        
        user = Usuario(
            username='usuario',
            email='usuario@inventario.com',
            password_hash=user_password.decode('utf-8'),
            rol='operador',
            activo=True
        )
        
        db.session.add(admin)
        db.session.add(user)
        
        # Crear categorías
        categorias = [
            Categoria(nombre='Electrónicos', descripcion='Productos electrónicos'),
            Categoria(nombre='Oficina', descripcion='Suministros de oficina'),
            Categoria(nombre='Herramientas', descripcion='Herramientas y equipos'),
            Categoria(nombre='Consumibles', descripcion='Productos consumibles')
        ]
        
        for categoria in categorias:
            db.session.add(categoria)
        
        # Crear proveedores
        proveedores = [
            Proveedor(
                nombre='TechSupply Corp',
                contacto='Juan Pérez',
                telefono='+1-555-0123',
                email='contacto@techsupply.com',
                direccion='123 Tech Street, Ciudad'
            ),
            Proveedor(
                nombre='Office Solutions',
                contacto='María García',
                telefono='+1-555-0456',
                email='ventas@officesolutions.com',
                direccion='456 Office Ave, Ciudad'
            ),
            Proveedor(
                nombre='Industrial Tools Inc',
                contacto='Carlos López',
                telefono='+1-555-0789',
                email='info@industrialtools.com',
                direccion='789 Industrial Blvd, Ciudad'
            )
        ]
        
        for proveedor in proveedores:
            db.session.add(proveedor)
        
        # Crear ubicaciones
        ubicaciones = [
            Ubicacion(
                nombre='Almacén Principal',
                descripcion='Almacén principal de la empresa',
                direccion='Calle Principal 123, Ciudad'
            ),
            Ubicacion(
                nombre='Almacén Secundario',
                descripcion='Almacén secundario para overflow',
                direccion='Avenida Secundaria 456, Ciudad'
            ),
            Ubicacion(
                nombre='Oficina Central',
                descripcion='Inventario de oficina central',
                direccion='Torre Empresarial, Piso 10, Ciudad'
            )
        ]
        
        for ubicacion in ubicaciones:
            db.session.add(ubicacion)
        
        # Crear tipos de transacción
        tipos_transaccion = [
            TipoTransaccion(nombre='Compra', descripcion='Entrada por compra', es_entrada=True),
            TipoTransaccion(nombre='Venta', descripcion='Salida por venta', es_entrada=False),
            TipoTransaccion(nombre='Ajuste Positivo', descripcion='Ajuste de inventario positivo', es_entrada=True),
            TipoTransaccion(nombre='Ajuste Negativo', descripcion='Ajuste de inventario negativo', es_entrada=False),
            TipoTransaccion(nombre='Transferencia Entrada', descripcion='Entrada por transferencia', es_entrada=True),
            TipoTransaccion(nombre='Transferencia Salida', descripcion='Salida por transferencia', es_entrada=False),
            TipoTransaccion(nombre='Devolución', descripcion='Entrada por devolución', es_entrada=True),
            TipoTransaccion(nombre='Merma', descripcion='Salida por merma o daño', es_entrada=False)
        ]
        
        for tipo in tipos_transaccion:
            db.session.add(tipo)
        
        # Commit para obtener IDs
        db.session.commit()
        
        # Crear productos de ejemplo
        productos = [
            Producto(
                codigo='LAPTOP001',
                nombre='Laptop Dell Inspiron 15',
                descripcion='Laptop Dell Inspiron 15 con procesador Intel i5',
                categoria_id=categorias[0].id,
                proveedor_id=proveedores[0].id,
                precio_unitario=899.99,
                unidad_medida='pcs',
                stock_minimo=5
            ),
            Producto(
                codigo='MOUSE001',
                nombre='Mouse Inalámbrico Logitech',
                descripcion='Mouse inalámbrico Logitech MX Master 3',
                categoria_id=categorias[0].id,
                proveedor_id=proveedores[0].id,
                precio_unitario=99.99,
                unidad_medida='pcs',
                stock_minimo=10
            ),
            Producto(
                codigo='PAPEL001',
                nombre='Papel Bond A4',
                descripcion='Resma de papel bond A4 75g',
                categoria_id=categorias[1].id,
                proveedor_id=proveedores[1].id,
                precio_unitario=4.99,
                unidad_medida='resma',
                stock_minimo=20
            ),
            Producto(
                codigo='TALADRO001',
                nombre='Taladro Eléctrico Bosch',
                descripcion='Taladro eléctrico Bosch Professional',
                categoria_id=categorias[2].id,
                proveedor_id=proveedores[2].id,
                precio_unitario=149.99,
                unidad_medida='pcs',
                stock_minimo=3
            ),
            Producto(
                codigo='TINTA001',
                nombre='Cartucho de Tinta HP Negro',
                descripcion='Cartucho de tinta HP 664 negro',
                categoria_id=categorias[3].id,
                proveedor_id=proveedores[0].id,
                precio_unitario=29.99,
                unidad_medida='pcs',
                stock_minimo=15
            )
        ]
        
        for producto in productos:
            db.session.add(producto)
        
        # Commit para obtener IDs de productos
        db.session.commit()
        
        # Crear inventario inicial
        inventarios = [
            # Almacén Principal
            Inventario(producto_id=productos[0].id, ubicacion_id=ubicaciones[0].id, cantidad=10),
            Inventario(producto_id=productos[1].id, ubicacion_id=ubicaciones[0].id, cantidad=25),
            Inventario(producto_id=productos[2].id, ubicacion_id=ubicaciones[0].id, cantidad=50),
            Inventario(producto_id=productos[3].id, ubicacion_id=ubicaciones[0].id, cantidad=8),
            Inventario(producto_id=productos[4].id, ubicacion_id=ubicaciones[0].id, cantidad=30),
            
            # Almacén Secundario
            Inventario(producto_id=productos[0].id, ubicacion_id=ubicaciones[1].id, cantidad=5),
            Inventario(producto_id=productos[1].id, ubicacion_id=ubicaciones[1].id, cantidad=15),
            Inventario(producto_id=productos[2].id, ubicacion_id=ubicaciones[1].id, cantidad=25),
            
            # Oficina Central
            Inventario(producto_id=productos[1].id, ubicacion_id=ubicaciones[2].id, cantidad=5),
            Inventario(producto_id=productos[2].id, ubicacion_id=ubicaciones[2].id, cantidad=10),
            Inventario(producto_id=productos[4].id, ubicacion_id=ubicaciones[2].id, cantidad=8)
        ]
        
        for inventario in inventarios:
            db.session.add(inventario)
        
        db.session.commit()
        
        print("✅ Base de datos inicializada exitosamente!")
        print("\n📋 Datos creados:")
        print(f"   • {len([admin, user])} usuarios")
        print(f"   • {len(categorias)} categorías")
        print(f"   • {len(proveedores)} proveedores")
        print(f"   • {len(ubicaciones)} ubicaciones")
        print(f"   • {len(tipos_transaccion)} tipos de transacción")
        print(f"   • {len(productos)} productos")
        print(f"   • {len(inventarios)} registros de inventario")
        
        print("\n🔐 Credenciales de acceso:")
        print("   Administrador:")
        print("     Usuario: admin")
        print("     Contraseña: admin123")
        print("   Operador:")
        print("     Usuario: usuario")
        print("     Contraseña: user123")

if __name__ == '__main__':
    init_database()

