from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_
import json

from src.models.inventory import db, Producto, Categoria, Proveedor, Usuario, AuditoriaBlockchain
from src.services.blockchain_service import blockchain_service

products_bp = Blueprint('products', __name__)

@products_bp.route('/', methods=['GET'])
@jwt_required()
def get_products():
    """Obtener lista de productos con filtros opcionales"""
    try:
        # Parámetros de consulta
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        categoria_id = request.args.get('categoria_id', type=int)
        proveedor_id = request.args.get('proveedor_id', type=int)
        activo = request.args.get('activo', type=bool)
        
        # Construir consulta
        query = Producto.query
        
        # Filtros
        if search:
            query = query.filter(or_(
                Producto.codigo.contains(search),
                Producto.nombre.contains(search),
                Producto.descripcion.contains(search)
            ))
        
        if categoria_id:
            query = query.filter_by(categoria_id=categoria_id)
        
        if proveedor_id:
            query = query.filter_by(proveedor_id=proveedor_id)
        
        if activo is not None:
            query = query.filter_by(activo=activo)
        
        # Paginación
        productos = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'products': [producto.to_dict() for producto in productos.items],
            'total': productos.total,
            'pages': productos.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    """Obtener un producto específico"""
    try:
        producto = Producto.query.get(product_id)
        
        if not producto:
            return jsonify({'error': 'Producto no encontrado'}), 404
        
        return jsonify({'product': producto.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/', methods=['POST'])
@jwt_required()
def create_product():
    """Crear nuevo producto"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['codigo', 'nombre']):
            return jsonify({'error': 'Código y nombre son requeridos'}), 400
        
        # Verificar que el código no exista
        if Producto.query.filter_by(codigo=data['codigo']).first():
            return jsonify({'error': 'El código de producto ya existe'}), 400
        
        # Verificar que la categoría existe si se proporciona
        if data.get('categoria_id'):
            categoria = Categoria.query.get(data['categoria_id'])
            if not categoria:
                return jsonify({'error': 'Categoría no encontrada'}), 400
        
        # Verificar que el proveedor existe si se proporciona
        if data.get('proveedor_id'):
            proveedor = Proveedor.query.get(data['proveedor_id'])
            if not proveedor:
                return jsonify({'error': 'Proveedor no encontrado'}), 400
        
        # Crear nuevo producto
        producto = Producto(
            codigo=data['codigo'],
            nombre=data['nombre'],
            descripcion=data.get('descripcion'),
            categoria_id=data.get('categoria_id'),
            proveedor_id=data.get('proveedor_id'),
            precio_unitario=data.get('precio_unitario'),
            unidad_medida=data.get('unidad_medida'),
            stock_minimo=data.get('stock_minimo', 0)
        )
        
        db.session.add(producto)
        db.session.flush()  # Para obtener el ID del producto
        
        # Registrar en blockchain
        try:
            blockchain_result = blockchain_service.register_product_on_blockchain({
                'id': producto.id,
                'codigo': producto.codigo,
                'nombre': producto.nombre,
                'descripcion': producto.descripcion,
                'categoria_id': producto.categoria_id,
                'proveedor_id': producto.proveedor_id,
                'precio_unitario': float(producto.precio_unitario) if producto.precio_unitario else None
            })
            
            if blockchain_result['success']:
                # Actualizar producto con hash blockchain
                producto.blockchain_hash = blockchain_result['tx_hash']
                
                # Crear registro de auditoría
                auditoria = AuditoriaBlockchain(
                    tabla_afectada='productos',
                    registro_id=producto.id,
                    accion='INSERT',
                    datos_nuevos=json.dumps(producto.to_dict()),
                    blockchain_tx_hash=blockchain_result['tx_hash'],
                    bloque_numero=blockchain_result.get('block_number'),
                    confirmado=not blockchain_result.get('simulated', False)
                )
                db.session.add(auditoria)
                
        except Exception as e:
            print(f"Error registrando producto en blockchain: {e}")
            # Continuar sin blockchain si hay error
        
        db.session.commit()
        
        return jsonify({
            'message': 'Producto creado exitosamente',
            'product': producto.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """Actualizar producto existente"""
    try:
        producto = Producto.query.get(product_id)
        
        if not producto:
            return jsonify({'error': 'Producto no encontrado'}), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No se proporcionaron datos para actualizar'}), 400
        
        # Verificar código único si se está cambiando
        if 'codigo' in data and data['codigo'] != producto.codigo:
            if Producto.query.filter_by(codigo=data['codigo']).first():
                return jsonify({'error': 'El código de producto ya existe'}), 400
            producto.codigo = data['codigo']
        
        # Actualizar campos
        if 'nombre' in data:
            producto.nombre = data['nombre']
        if 'descripcion' in data:
            producto.descripcion = data['descripcion']
        if 'categoria_id' in data:
            if data['categoria_id'] and not Categoria.query.get(data['categoria_id']):
                return jsonify({'error': 'Categoría no encontrada'}), 400
            producto.categoria_id = data['categoria_id']
        if 'proveedor_id' in data:
            if data['proveedor_id'] and not Proveedor.query.get(data['proveedor_id']):
                return jsonify({'error': 'Proveedor no encontrado'}), 400
            producto.proveedor_id = data['proveedor_id']
        if 'precio_unitario' in data:
            producto.precio_unitario = data['precio_unitario']
        if 'unidad_medida' in data:
            producto.unidad_medida = data['unidad_medida']
        if 'stock_minimo' in data:
            producto.stock_minimo = data['stock_minimo']
        if 'activo' in data:
            producto.activo = data['activo']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Producto actualizado exitosamente',
            'product': producto.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    """Eliminar producto (soft delete)"""
    try:
        current_user_id = get_jwt_identity()
        current_user = Usuario.query.get(current_user_id)
        
        if not current_user or current_user.rol != 'administrador':
            return jsonify({'error': 'Acceso denegado. Solo administradores pueden eliminar productos'}), 403
        
        producto = Producto.query.get(product_id)
        
        if not producto:
            return jsonify({'error': 'Producto no encontrado'}), 404
        
        # Soft delete
        producto.activo = False
        db.session.commit()
        
        return jsonify({'message': 'Producto eliminado exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    """Obtener lista de categorías"""
    try:
        categorias = Categoria.query.filter_by(activa=True).all()
        
        return jsonify({
            'categories': [categoria.to_dict() for categoria in categorias]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    """Crear nueva categoría"""
    try:
        data = request.get_json()
        
        if not data or not data.get('nombre'):
            return jsonify({'error': 'Nombre es requerido'}), 400
        
        categoria = Categoria(
            nombre=data['nombre'],
            descripcion=data.get('descripcion')
        )
        
        db.session.add(categoria)
        db.session.commit()
        
        return jsonify({
            'message': 'Categoría creada exitosamente',
            'category': categoria.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/suppliers', methods=['GET'])
@jwt_required()
def get_suppliers():
    """Obtener lista de proveedores"""
    try:
        proveedores = Proveedor.query.filter_by(activo=True).all()
        
        return jsonify({
            'suppliers': [proveedor.to_dict() for proveedor in proveedores]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/suppliers', methods=['POST'])
@jwt_required()
def create_supplier():
    """Crear nuevo proveedor"""
    try:
        data = request.get_json()
        
        if not data or not data.get('nombre'):
            return jsonify({'error': 'Nombre es requerido'}), 400
        
        proveedor = Proveedor(
            nombre=data['nombre'],
            contacto=data.get('contacto'),
            telefono=data.get('telefono'),
            email=data.get('email'),
            direccion=data.get('direccion')
        )
        
        db.session.add(proveedor)
        db.session.commit()
        
        return jsonify({
            'message': 'Proveedor creado exitosamente',
            'supplier': proveedor.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@products_bp.route('/low-stock', methods=['GET'])
@jwt_required()
def get_low_stock_products():
    """Obtener productos con stock bajo"""
    try:
        productos = Producto.query.filter(
            Producto.activo == True
        ).all()
        
        productos_bajo_stock = []
        for producto in productos:
            stock_actual = producto.get_stock_total()
            if stock_actual <= producto.stock_minimo:
                producto_dict = producto.to_dict()
                producto_dict['stock_actual'] = stock_actual
                productos_bajo_stock.append(producto_dict)
        
        return jsonify({
            'products': productos_bajo_stock,
            'count': len(productos_bajo_stock)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

