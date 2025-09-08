
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(50), default='cliente')
    nombre = db.Column(db.String(100))
    telefono = db.Column(db.String(20))
    direccion = db.Column(db.Text)
    activo = db.Column(db.Boolean, default=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

class Categoria(db.Model):
    __tablename__ = 'categorias'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    activo = db.Column(db.Boolean, default=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

class Producto(db.Model):
    __tablename__ = 'productos'
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(50), unique=True, nullable=False)
    nombre = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias.id'))
    precio_unitario = db.Column(db.Numeric(10, 2), nullable=False)
    precio_venta = db.Column(db.Numeric(10, 2))
    unidad_medida = db.Column(db.String(20), default='pcs')
    stock_minimo = db.Column(db.Integer, default=0)
    imagen_url = db.Column(db.Text)
    activo = db.Column(db.Boolean, default=True)
    disponible_venta = db.Column(db.Boolean, default=True)
    blockchain_hash = db.Column(db.String(255))
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    categoria = db.relationship('Categoria', backref='productos')

class Ubicacion(db.Model):
    __tablename__ = 'ubicaciones'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    direccion = db.Column(db.Text)
    activo = db.Column(db.Boolean, default=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

class Inventario(db.Model):
    __tablename__ = 'inventario'
    id = db.Column(db.Integer, primary_key=True)
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'), nullable=False)
    ubicacion_id = db.Column(db.Integer, db.ForeignKey('ubicaciones.id'), nullable=False)
    cantidad = db.Column(db.Integer, default=0)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow)
    producto = db.relationship('Producto', backref='inventarios')
    ubicacion = db.relationship('Ubicacion', backref='inventarios')
    __table_args__ = (db.UniqueConstraint('producto_id', 'ubicacion_id', name='_producto_ubicacion_uc'),)

class TipoTransaccion(db.Model):
    __tablename__ = 'tipos_transaccion'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)
    descripcion = db.Column(db.Text)
    activo = db.Column(db.Boolean, default=True)

class Transaccion(db.Model):
    __tablename__ = 'transacciones'
    id = db.Column(db.Integer, primary_key=True)
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'), nullable=False)
    ubicacion_id = db.Column(db.Integer, db.ForeignKey('ubicaciones.id'), nullable=False)
    tipo_transaccion_id = db.Column(db.Integer, db.ForeignKey('tipos_transaccion.id'), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Numeric(10, 2))
    total = db.Column(db.Numeric(10, 2))
    referencia = db.Column(db.String(100))
    observaciones = db.Column(db.Text)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    blockchain_tx_hash = db.Column(db.String(255))
    blockchain_confirmado = db.Column(db.Boolean, default=False)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    producto = db.relationship('Producto', backref='transacciones')
    ubicacion = db.relationship('Ubicacion', backref='transacciones')
    tipo_transaccion = db.relationship('TipoTransaccion', backref='transacciones')
    usuario = db.relationship('Usuario', backref='transacciones')

class Pedido(db.Model):
    __tablename__ = 'pedidos'
    id = db.Column(db.Integer, primary_key=True)
    numero_pedido = db.Column(db.String(50), unique=True, nullable=False)
    cliente_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    estado = db.Column(db.String(50), default='pendiente')
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    impuestos = db.Column(db.Numeric(10, 2), default=0)
    total = db.Column(db.Numeric(10, 2), nullable=False)
    direccion_entrega = db.Column(db.Text)
    telefono_contacto = db.Column(db.String(20))
    observaciones = db.Column(db.Text)
    fecha_pedido = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_entrega = db.Column(db.DateTime)
    cliente = db.relationship('Usuario', backref='pedidos')

class DetallePedido(db.Model):
    __tablename__ = 'detalle_pedidos'
    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedidos.id'), nullable=False)
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Numeric(10, 2), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    pedido = db.relationship('Pedido', backref='detalles')
    producto = db.relationship('Producto', backref='detalles_pedido')

class Pago(db.Model):
    __tablename__ = 'pagos'
    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedidos.id'), nullable=False)
    metodo_pago = db.Column(db.String(50), nullable=False)
    monto = db.Column(db.Numeric(10, 2), nullable=False)
    estado = db.Column(db.String(50), default='pendiente')
    referencia_pago = db.Column(db.String(100))
    qr_code = db.Column(db.Text)
    fecha_pago = db.Column(db.DateTime, default=datetime.utcnow)
    pedido = db.relationship('Pedido', backref='pagos')


