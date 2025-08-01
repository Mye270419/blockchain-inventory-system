from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt

db = SQLAlchemy()

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    rol = db.Column(db.String(50), default='usuario')  # administrador, usuario, etc.
    activo = db.Column(db.Boolean, default=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    ultima_conexion = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Usuario {self.username}>'

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'rol': self.rol,
            'activo': self.activo,
            'fecha_creacion': self.fecha_creacion.isoformat(),
            'ultima_conexion': self.ultima_conexion.isoformat() if self.ultima_conexion else None
        }

class Categoria(db.Model):
    __tablename__ = 'categorias'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
    descripcion = db.Column(db.String(255))
    activa = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return f'<Categoria {self.nombre}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'activa': self.activa
        }

class Proveedor(db.Model):
    __tablename__ = 'proveedores'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    contacto = db.Column(db.String(100))
    telefono = db.Column(db.String(20))
    email = db.Column(db.String(120))
    activo = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return f'<Proveedor {self.nombre}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'contacto': self.contacto,
            'telefono': self.telefono,
            'email': self.email,
            'activo': self.activo
        }

class Producto(db.Model):
    __tablename__ = 'productos'
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(50), unique=True, nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.String(255))
    precio_unitario = db.Column(db.Float, nullable=False)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias.id'))
    proveedor_id = db.Column(db.Integer, db.ForeignKey('proveedores.id'))
    stock_minimo = db.Column(db.Integer, default=0)
    activo = db.Column(db.Boolean, default=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

    categoria = db.relationship('Categoria', backref=db.backref('productos', lazy=True))
    proveedor = db.relationship('Proveedor', backref=db.backref('productos', lazy=True))

    def __repr__(self):
        return f'<Producto {self.nombre}>'

    def to_dict(self):
        return {
            'id': self.id,
            'codigo': self.codigo,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'precio_unitario': self.precio_unitario,
            'categoria_id': self.categoria_id,
            'proveedor_id': self.proveedor_id,
            'stock_minimo': self.stock_minimo,
            'activo': self.activo,
            'fecha_creacion': self.fecha_creacion.isoformat(),
            'categoria_nombre': self.categoria.nombre if self.categoria else None,
            'proveedor_nombre': self.proveedor.nombre if self.proveedor else None
        }
    
    def get_stock_total(self):
        total = db.session.query(db.func.sum(Inventario.cantidad)).filter(Inventario.producto_id == self.id).scalar()
        return total if total is not None else 0

class Ubicacion(db.Model):
    __tablename__ = 'ubicaciones'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
    descripcion = db.Column(db.String(255))
    direccion = db.Column(db.String(255))
    activa = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return f'<Ubicacion {self.nombre}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'direccion': self.direccion,
            'activa': self.activa
        }

class Inventario(db.Model):
    __tablename__ = 'inventario'
    id = db.Column(db.Integer, primary_key=True)
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'), nullable=False)
    ubicacion_id = db.Column(db.Integer, db.ForeignKey('ubicaciones.id'), nullable=False)
    cantidad = db.Column(db.Integer, default=0)
    fecha_ultima_actualizacion = db.Column(db.DateTime, default=datetime.utcnow)

    producto = db.relationship('Producto', backref=db.backref('inventario_registros', lazy=True))
    ubicacion = db.relationship('Ubicacion', backref=db.backref('inventario_registros', lazy=True))

    def __repr__(self):
        return f'<Inventario Producto:{self.producto_id} Ubicacion:{self.ubicacion_id} Cantidad:{self.cantidad}>'

    def to_dict(self):
        return {
            'id': self.id,
            'producto_id': self.producto_id,
            'ubicacion_id': self.ubicacion_id,
            'cantidad': self.cantidad,
            'fecha_ultima_actualizacion': self.fecha_ultima_actualizacion.isoformat(),
            'producto_nombre': self.producto.nombre if self.producto else None,
            'ubicacion_nombre': self.ubicacion.nombre if self.ubicacion else None
        }

class TipoTransaccion(db.Model):
    __tablename__ = 'tipos_transaccion'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
    descripcion = db.Column(db.String(255))
    es_entrada = db.Column(db.Boolean, nullable=False) # True si es entrada (suma stock), False si es salida (resta stock)

    def __repr__(self):
        return f'<TipoTransaccion {self.nombre}>'

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
    fecha_transaccion = db.Column(db.DateTime, default=datetime.utcnow)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'))
    comentarios = db.Column(db.String(255))

    producto = db.relationship('Producto', backref=db.backref('transacciones', lazy=True))
    ubicacion = db.relationship('Ubicacion', backref=db.backref('transacciones', lazy=True))
    tipo_transaccion = db.relationship('TipoTransaccion', backref=db.backref('transacciones', lazy=True))
    usuario = db.relationship('Usuario', backref=db.backref('transacciones', lazy=True))

    def __repr__(self):
        return f'<Transaccion {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'producto_id': self.producto_id,
            'ubicacion_id': self.ubicacion_id,
            'tipo_transaccion_id': self.tipo_transaccion_id,
            'cantidad': self.cantidad,
            'fecha_transaccion': self.fecha_transaccion.isoformat(),
            'usuario_id': self.usuario_id,
            'comentarios': self.comentarios,
            'producto_nombre': self.producto.nombre if self.producto else None,
            'ubicacion_nombre': self.ubicacion.nombre if self.ubicacion else None,
            'tipo_transaccion_nombre': self.tipo_transaccion.nombre if self.tipo_transaccion else None,
            'usuario_username': self.usuario.username if self.usuario else None
        }

class AuditoriaBlockchain(db.Model):
    __tablename__ = 'auditoria_blockchain'
    id = db.Column(db.Integer, primary_key=True)
    transaccion_id = db.Column(db.Integer, db.ForeignKey('transacciones.id'), nullable=False)
    hash_transaccion = db.Column(db.String(255), unique=True, nullable=False)
    hash_bloque = db.Column(db.String(255), nullable=False)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)

    transaccion = db.relationship('Transaccion', backref=db.backref('auditorias_blockchain', lazy=True))

    def __repr__(self):
        return f'<AuditoriaBlockchain {self.hash_transaccion}>'

    def to_dict(self):
        return {
            'id': self.id,
            'transaccion_id': self.transaccion_id,
            'hash_transaccion': self.hash_transaccion,
            'hash_bloque': self.hash_bloque,
            'fecha_registro': self.fecha_registro.isoformat()
        }


