import os
import sys
from datetime import timedelta

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Añadir el directorio raíz del backend al path para importar módulos
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__),from src.models.inventory import db, Usuario, Categoria, Proveedor, Producto, Ubicacion, Inventario, TipoTransaccion, Transaccion, AuditoriaBlockchain

# Importar blueprints
from src.routes.auth import auth_bp src.routes.inventory import inventory_bp
from src.routes.transactions import transactions_bp
from src.routes.blockchain import blockchain_bp

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Configuración
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Configuración de base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configuración de CORS
CORS(app, origins="*")

# Inicializar extensiones
jwt = JWTManager(app)
db.init_app(app)

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')

app.register_blueprint(products_bp, url_prefix='/api/products')
app.register_blueprint(inventory_bp, url_prefix='/api/inventory')
app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
app.register_blueprint(blockchain_bp, url_prefix='/api/blockchain')

# Crear tablas y datos iniciales
with app.app_context():
    db.create_all()
    
    # Crear datos iniciales si no existen
    if not TipoTransaccion.query.first():
        tipos_transaccion = [
            TipoTransaccion(nombre='Compra', descripcion='Entrada de productos por compra', es_entrada=True),
            TipoTransaccion(nombre='Venta', descripcion='Salida de productos por venta', es_entrada=False),
            TipoTransaccion(nombre='Ajuste Positivo', descripcion='Ajuste de inventario - incremento', es_entrada=True),
            TipoTransaccion(nombre='Ajuste Negativo', descripcion='Ajuste de inventario - decremento', es_entrada=False),
            TipoTransaccion(nombre='Transferencia Entrada', descripcion='Entrada por transferencia entre ubicaciones', es_entrada=True),
            TipoTransaccion(nombre='Transferencia Salida', descripcion='Salida por transferencia entre ubicaciones', es_entrada=False),
            TipoTransaccion(nombre='Devolución Cliente', descripcion='Entrada por devolución de cliente', es_entrada=True),
            TipoTransaccion(nombre='Devolución Proveedor', descripcion='Salida por devolución a proveedor', es_entrada=False)
        ]
        for tipo in tipos_transaccion:
            db.session.add(tipo)
    
    if not Categoria.query.first():
        categorias = [
            Categoria(nombre='Electrónicos', descripcion='Productos electrónicos y tecnológicos'),
            Categoria(nombre='Oficina', descripcion='Suministros y equipos de oficina'),
            Categoria(nombre='Herramientas', descripcion='Herramientas y equipos de trabajo'),
            Categoria(nombre='Consumibles', descripcion='Productos de consumo regular')
        ]
        for categoria in categorias:
            db.session.add(categoria)
    
    if not Ubicacion.query.first():
        ubicaciones = [
            Ubicacion(nombre='Almacén Principal', descripcion='Almacén central de la empresa'),
            Ubicacion(nombre='Tienda', descripcion='Área de ventas al público'),
            Ubicacion(nombre='Depósito Temporal', descripcion='Área temporal para productos en tránsito')
        ]
        for ubicacion in ubicaciones:
            db.session.add(ubicacion)
    
    # Crear usuario administrador por defecto si no existe
    if not Usuario.query.filter_by(username='admin').first():
        import bcrypt
        password_hash = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        admin_user = Usuario(
            username='admin',
            email='admin@empresa.com',
            password_hash=password_hash,
            rol='administrador'
        )
        db.session.add(admin_user)
    
    db.session.commit()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

@app.errorhandler(404)
def not_found(error):
    return {'error': 'Endpoint no encontrado'}, 404

@app.errorhandler(500)
def internal_error(error):
    return {'error': 'Error interno del servidor'}, 500

