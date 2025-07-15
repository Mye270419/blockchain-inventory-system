from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import hashlib
import json

db = SQLAlchemy()

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(20), default='usuario')
    activo = db.Column(db.Boolean, default=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    ultima_conexion = db.Column(db.DateTime)
    
    # Relaciones
    transacciones = db.relationship('Transaccion', backref='usuario', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'rol': self.rol,
            'activo': self.activo,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'ultima_conexion': self.ultima_conexion.isoformat() if self.ultima_conexion else None
        }

class Categoria(db.Model):
    __tablename__ = 'categorias'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    activa = db.Column(db.Boolean, default=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    productos = db.relationship('Producto', backref='categoria', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'activa': self.activa,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None
        }

class Proveedor(db.Model):
    __tablename__ = 'proveedores'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    contacto = db.Column(db.String(100))
    telefono = db.Column(db.String(20))
    email = db.Column(db.String(100))
    direccion = db.Column(db.Text)
    activo = db.Column(db.Boolean, default=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    productos = db.relationship('Producto', backref='proveedor', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'contacto': self.contacto,
            'telefono': self.telefono,
            'email': self.email,
            'direccion': self.direccion,
            'activo': self.activo,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None
        }

class Producto(db.Model):
    __tablename__ = 'productos'
    
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(50), unique=True, nullable=False)
    nombre = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias.id'))
    proveedor_id = db.Column(db.Integer, db.ForeignKey('proveedores.id'))
    precio_unitario = db.Column(db.Numeric(10, 2))
    unidad_medida = db.Column(db.String(20))
    stock_minimo = db.Column(db.Integer, default=0)
    blockchain_hash = db.Column(db.String(66))  # Hash de la transacción en blockchain
    activo = db.Column(db.Boolean, default=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    inventarios = db.relationship('Inventario', backref='producto', lazy=True)
    transacciones = db.relationship('Transaccion', backref='producto', lazy=True)
    
    def generate_data_hash(self):
        """Genera un hash de los datos del producto para blockchain"""
        data = {
            'codigo': self.codigo,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'categoria_id': self.categoria_id,
            'proveedor_id': self.proveedor_id,
            'precio_unitario': float(self.precio_unitario) if self.precio_unitario else None
        }
        data_string = json.dumps(data, sort_keys=True)
        return hashlib.sha256(data_string.encode()).hexdigest()
    
    def get_stock_total(self):
        """Obtiene el stock total del producto en todas las ubicaciones"""
        total = db.session.query(db.func.sum(Inventario.cantidad)).filter_by(producto_id=self.id).scalar()
        return total or 0
    
    def to_dict(self):
        return {
            'id': self.id,
            'codigo': self.codigo,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'categoria_id': self.categoria_id,
            'categoria_nombre': self.categoria.nombre if self.categoria else None,
            'proveedor_id': self.proveedor_id,
            'proveedor_nombre': self.proveedor.nombre if self.proveedor else None,
            'precio_unitario': float(self.precio_unitario) if self.precio_unitario else None,
            'unidad_medida': self.unidad_medida,
            'stock_minimo': self.stock_minimo,
            'stock_total': self.get_stock_total(),
            'blockchain_hash': self.blockchain_hash,
            'activo': self.activo,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'fecha_actualizacion': self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None
        }

class Ubicacion(db.Model):
    __tablename__ = 'ubicaciones'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    direccion = db.Column(db.Text)
    activa = db.Column(db.Boolean, default=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    inventarios = db.relationship('Inventario', backref='ubicacion', lazy=True)
    transacciones = db.relationship('Transaccion', backref='ubicacion', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'direccion': self.direccion,
            'activa': self.activa,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None
        }

class Inventario(db.Model):
    __tablename__ = 'inventario'
    
    id = db.Column(db.Integer, primary_key=True)
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'), nullable=False)
    ubicacion_id = db.Column(db.Integer, db.ForeignKey('ubicaciones.id'), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False, default=0)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Constraint único
    __table_args__ = (db.UniqueConstraint('producto_id', 'ubicacion_id', name='unique_producto_ubicacion'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'producto_id': self.producto_id,
            'producto_codigo': self.producto.codigo if self.producto else None,
            'producto_nombre': self.producto.nombre if self.producto else None,
            'ubicacion_id': self.ubicacion_id,
            'ubicacion_nombre': self.ubicacion.nombre if self.ubicacion else None,
            'cantidad': self.cantidad,
            'fecha_actualizacion': self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None
        }

class TipoTransaccion(db.Model):
    __tablename__ = 'tipos_transaccion'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    descripcion = db.Column(db.Text)
    es_entrada = db.Column(db.Boolean, nullable=False)  # TRUE para entradas, FALSE para salidas
    
    # Relaciones
    transacciones = db.relationship('Transaccion', backref='tipo_transaccion', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'es_entrada': self.es_entrada
        }

class Transaccion(db.Model):
    __tablename__ = 'transacciones'
    
    id = db.Column(db.Integer, primary_key=True)
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'), nullable=False)
    ubicacion_id = db.Column(db.Integer, db.ForeignKey('ubicaciones.id'), nullable=False)
    tipo_transaccion_id = db.Column(db.Integer, db.ForeignKey('tipos_transaccion.id'), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Numeric(10, 2))
    total = db.Column(db.Numeric(10, 2))
    referencia = db.Column(db.String(100))  # Número de factura, orden, etc.
    observaciones = db.Column(db.Text)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    blockchain_tx_hash = db.Column(db.String(66))  # Hash de transacción blockchain
    blockchain_confirmado = db.Column(db.Boolean, default=False)
    fecha_transaccion = db.Column(db.DateTime, default=datetime.utcnow)
    
    def generate_data_hash(self):
        """Genera un hash de los datos de la transacción para blockchain"""
        data = {
            'producto_id': self.producto_id,
            'ubicacion_id': self.ubicacion_id,
            'tipo_transaccion_id': self.tipo_transaccion_id,
            'cantidad': self.cantidad,
            'precio_unitario': float(self.precio_unitario) if self.precio_unitario else None,
            'referencia': self.referencia,
            'usuario_id': self.usuario_id
        }
        data_string = json.dumps(data, sort_keys=True)
        return hashlib.sha256(data_string.encode()).hexdigest()
    
    def to_dict(self):
        return {
            'id': self.id,
            'producto_id': self.producto_id,
            'producto_codigo': self.producto.codigo if self.producto else None,
            'producto_nombre': self.producto.nombre if self.producto else None,
            'ubicacion_id': self.ubicacion_id,
            'ubicacion_nombre': self.ubicacion.nombre if self.ubicacion else None,
            'tipo_transaccion_id': self.tipo_transaccion_id,
            'tipo_transaccion_nombre': self.tipo_transaccion.nombre if self.tipo_transaccion else None,
            'es_entrada': self.tipo_transaccion.es_entrada if self.tipo_transaccion else None,
            'cantidad': self.cantidad,
            'precio_unitario': float(self.precio_unitario) if self.precio_unitario else None,
            'total': float(self.total) if self.total else None,
            'referencia': self.referencia,
            'observaciones': self.observaciones,
            'usuario_id': self.usuario_id,
            'usuario_username': self.usuario.username if self.usuario else None,
            'blockchain_tx_hash': self.blockchain_tx_hash,
            'blockchain_confirmado': self.blockchain_confirmado,
            'fecha_transaccion': self.fecha_transaccion.isoformat() if self.fecha_transaccion else None
        }

class AuditoriaBlockchain(db.Model):
    __tablename__ = 'auditoria_blockchain'
    
    id = db.Column(db.Integer, primary_key=True)
    tabla_afectada = db.Column(db.String(50), nullable=False)
    registro_id = db.Column(db.Integer, nullable=False)
    accion = db.Column(db.String(20), nullable=False)  # INSERT, UPDATE, DELETE
    datos_anteriores = db.Column(db.Text)  # JSON con datos previos
    datos_nuevos = db.Column(db.Text)  # JSON con datos nuevos
    blockchain_tx_hash = db.Column(db.String(66))
    bloque_numero = db.Column(db.Integer)
    confirmado = db.Column(db.Boolean, default=False)
    fecha_evento = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'tabla_afectada': self.tabla_afectada,
            'registro_id': self.registro_id,
            'accion': self.accion,
            'datos_anteriores': json.loads(self.datos_anteriores) if self.datos_anteriores else None,
            'datos_nuevos': json.loads(self.datos_nuevos) if self.datos_nuevos else None,
            'blockchain_tx_hash': self.blockchain_tx_hash,
            'bloque_numero': self.bloque_numero,
            'confirmado': self.confirmado,
            'fecha_evento': self.fecha_evento.isoformat() if self.fecha_evento else None
        }

