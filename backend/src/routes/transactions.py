from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from sqlalchemy import func, desc
import json

from src.models.inventory import db, Transaccion, TipoTransaccion, Producto, Ubicacion, Inventario, Usuario, AuditoriaBlockchain
from src.services.blockchain_service import blockchain_service

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/', methods=['GET'])
@jwt_required()
def get_transactions():
    """Obtener lista de transacciones con filtros opcionales"""
    try:
        # Parámetros de consulta
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        producto_id = request.args.get('producto_id', type=int)
        ubicacion_id = request.args.get('ubicacion_id', type=int)
        tipo_transaccion_id = request.args.get('tipo_transaccion_id', type=int)
        usuario_id = request.args.get('usuario_id', type=int)
        fecha_desde = request.args.get('fecha_desde')
        fecha_hasta = request.args.get('fecha_hasta')
        
        # Construir consulta
        query = Transaccion.query.join(Producto).join(Ubicacion).join(TipoTransaccion).join(Usuario)
        
        # Filtros
        if producto_id:
            query = query.filter(Transaccion.producto_id == producto_id)
        
        if ubicacion_id:
            query = query.filter(Transaccion.ubicacion_id == ubicacion_id)
        
        if tipo_transaccion_id:
            query = query.filter(Transaccion.tipo_transaccion_id == tipo_transaccion_id)
        
        if usuario_id:
            query = query.filter(Transaccion.usuario_id == usuario_id)
        
        if fecha_desde:
            try:
                fecha_desde_dt = datetime.fromisoformat(fecha_desde)
                query = query.filter(Transaccion.fecha_transaccion >= fecha_desde_dt)
            except ValueError:
                return jsonify({'error': 'Formato de fecha_desde inválido. Use ISO format'}), 400
        
        if fecha_hasta:
            try:
                fecha_hasta_dt = datetime.fromisoformat(fecha_hasta)
                query = query.filter(Transaccion.fecha_transaccion <= fecha_hasta_dt)
            except ValueError:
                return jsonify({'error': 'Formato de fecha_hasta inválido. Use ISO format'}), 400
        
        # Ordenar por fecha descendente
        query = query.order_by(desc(Transaccion.fecha_transaccion))
        
        # Paginación
        transacciones = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'transactions': [transaccion.to_dict() for transaccion in transacciones.items],
            'total': transacciones.total,
            'pages': transacciones.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/<int:transaction_id>', methods=['GET'])
@jwt_required()
def get_transaction(transaction_id):
    """Obtener una transacción específica"""
    try:
        transaccion = Transaccion.query.get(transaction_id)
        
        if not transaccion:
            return jsonify({'error': 'Transacción no encontrada'}), 404
        
        return jsonify({'transaction': transaccion.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/', methods=['POST'])
@jwt_required()
def create_transaction():
    """Crear nueva transacción de inventario"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not all(k in data for k in ['producto_id', 'ubicacion_id', 'tipo_transaccion_id', 'cantidad']):
            return jsonify({'error': 'producto_id, ubicacion_id, tipo_transaccion_id y cantidad son requeridos'}), 400
        
        producto_id = data['producto_id']
        ubicacion_id = data['ubicacion_id']
        tipo_transaccion_id = data['tipo_transaccion_id']
        cantidad = data['cantidad']
        precio_unitario = data.get('precio_unitario')
        referencia = data.get('referencia')
        observaciones = data.get('observaciones')
        
        if cantidad <= 0:
            return jsonify({'error': 'La cantidad debe ser mayor a cero'}), 400
        
        # Verificar que el producto, ubicación y tipo de transacción existen
        producto = Producto.query.get(producto_id)
        if not producto or not producto.activo:
            return jsonify({'error': 'Producto no encontrado o inactivo'}), 404
        
        ubicacion = Ubicacion.query.get(ubicacion_id)
        if not ubicacion or not ubicacion.activa:
            return jsonify({'error': 'Ubicación no encontrada o inactiva'}), 404
        
        tipo_transaccion = TipoTransaccion.query.get(tipo_transaccion_id)
        if not tipo_transaccion:
            return jsonify({'error': 'Tipo de transacción no encontrado'}), 404
        
        # Calcular total si se proporciona precio unitario
        total = None
        if precio_unitario:
            total = precio_unitario * cantidad
        
        # Para salidas, verificar que hay suficiente stock
        if not tipo_transaccion.es_entrada:
            inventario = Inventario.query.filter_by(
                producto_id=producto_id,
                ubicacion_id=ubicacion_id
            ).first()
            
            stock_actual = inventario.cantidad if inventario else 0
            if stock_actual < cantidad:
                return jsonify({'error': f'Stock insuficiente. Stock actual: {stock_actual}'}), 400
        
        # Crear transacción
        transaccion = Transaccion(
            producto_id=producto_id,
            ubicacion_id=ubicacion_id,
            tipo_transaccion_id=tipo_transaccion_id,
            cantidad=cantidad,
            precio_unitario=precio_unitario,
            total=total,
            referencia=referencia,
            observaciones=observaciones,
            usuario_id=current_user_id
        )
        
        db.session.add(transaccion)
        
        # Actualizar inventario
        inventario = Inventario.query.filter_by(
            producto_id=producto_id,
            ubicacion_id=ubicacion_id
        ).first()
        
        if not inventario:
            inventario = Inventario(
                producto_id=producto_id,
                ubicacion_id=ubicacion_id,
                cantidad=0
            )
            db.session.add(inventario)
        
        # Aplicar cambio según tipo de transacción
        if tipo_transaccion.es_entrada:
            inventario.cantidad += cantidad
        else:
            inventario.cantidad -= cantidad
        
        db.session.flush()  # Para obtener el ID de la transacción
        
        # Registrar en blockchain
        try:
            blockchain_result = blockchain_service.record_inventory_transaction_on_blockchain({
                'id': transaccion.id,
                'producto_id': producto_id,
                'ubicacion_id': ubicacion_id,
                'cantidad': cantidad,
                'precio_unitario': precio_unitario or 0,
                'tipo_transaccion': tipo_transaccion.nombre,
                'es_entrada': tipo_transaccion.es_entrada,
                'referencia': referencia,
                'usuario_id': current_user_id
            })
            
            if blockchain_result['success']:
                # Actualizar transacción con hash blockchain
                transaccion.blockchain_tx_hash = blockchain_result['tx_hash']
                transaccion.blockchain_confirmado = not blockchain_result.get('simulated', False)
                
                # Crear registro de auditoría
                auditoria = AuditoriaBlockchain(
                    tabla_afectada='transacciones',
                    registro_id=transaccion.id,
                    accion='INSERT',
                    datos_nuevos=json.dumps(transaccion.to_dict()),
                    blockchain_tx_hash=blockchain_result['tx_hash'],
                    bloque_numero=blockchain_result.get('block_number'),
                    confirmado=not blockchain_result.get('simulated', False)
                )
                db.session.add(auditoria)
                
        except Exception as e:
            print(f"Error registrando transacción en blockchain: {e}")
            # Continuar sin blockchain si hay error
        
        db.session.commit()
        
        return jsonify({
            'message': 'Transacción creada exitosamente',
            'transaction': transaccion.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/types', methods=['GET'])
@jwt_required()
def get_transaction_types():
    """Obtener tipos de transacción"""
    try:
        tipos = TipoTransaccion.query.all()
        
        return jsonify({
            'transaction_types': [tipo.to_dict() for tipo in tipos]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_transactions_summary():
    """Obtener resumen de transacciones"""
    try:
        # Parámetros de fecha
        fecha_desde = request.args.get('fecha_desde')
        fecha_hasta = request.args.get('fecha_hasta')
        
        # Si no se especifican fechas, usar último mes
        if not fecha_desde:
            fecha_desde = (datetime.utcnow() - timedelta(days=30)).isoformat()
        if not fecha_hasta:
            fecha_hasta = datetime.utcnow().isoformat()
        
        try:
            fecha_desde_dt = datetime.fromisoformat(fecha_desde)
            fecha_hasta_dt = datetime.fromisoformat(fecha_hasta)
        except ValueError:
            return jsonify({'error': 'Formato de fecha inválido. Use ISO format'}), 400
        
        # Total de transacciones en el período
        total_transacciones = Transaccion.query.filter(
            Transaccion.fecha_transaccion >= fecha_desde_dt,
            Transaccion.fecha_transaccion <= fecha_hasta_dt
        ).count()
        
        # Transacciones por tipo
        transacciones_por_tipo = db.session.query(
            TipoTransaccion.nombre,
            TipoTransaccion.es_entrada,
            func.count(Transaccion.id).label('cantidad'),
            func.sum(Transaccion.total).label('valor_total')
        ).join(Transaccion).filter(
            Transaccion.fecha_transaccion >= fecha_desde_dt,
            Transaccion.fecha_transaccion <= fecha_hasta_dt
        ).group_by(
            TipoTransaccion.id, TipoTransaccion.nombre, TipoTransaccion.es_entrada
        ).all()
        
        # Productos más movidos
        productos_mas_movidos = db.session.query(
            Producto.codigo,
            Producto.nombre,
            func.sum(Transaccion.cantidad).label('cantidad_total'),
            func.count(Transaccion.id).label('num_transacciones')
        ).join(Transaccion).filter(
            Transaccion.fecha_transaccion >= fecha_desde_dt,
            Transaccion.fecha_transaccion <= fecha_hasta_dt
        ).group_by(
            Producto.id, Producto.codigo, Producto.nombre
        ).order_by(
            func.sum(Transaccion.cantidad).desc()
        ).limit(10).all()
        
        # Transacciones por día (últimos 7 días)
        transacciones_por_dia = db.session.query(
            func.date(Transaccion.fecha_transaccion).label('fecha'),
            func.count(Transaccion.id).label('cantidad')
        ).filter(
            Transaccion.fecha_transaccion >= fecha_desde_dt,
            Transaccion.fecha_transaccion <= fecha_hasta_dt
        ).group_by(
            func.date(Transaccion.fecha_transaccion)
        ).order_by(
            func.date(Transaccion.fecha_transaccion)
        ).all()
        
        return jsonify({
            'summary': {
                'total_transacciones': total_transacciones,
                'fecha_desde': fecha_desde,
                'fecha_hasta': fecha_hasta,
                'transacciones_por_tipo': [
                    {
                        'tipo': t.nombre,
                        'es_entrada': t.es_entrada,
                        'cantidad': t.cantidad,
                        'valor_total': float(t.valor_total) if t.valor_total else 0
                    } for t in transacciones_por_tipo
                ],
                'productos_mas_movidos': [
                    {
                        'codigo': p.codigo,
                        'nombre': p.nombre,
                        'cantidad_total': int(p.cantidad_total),
                        'num_transacciones': p.num_transacciones
                    } for p in productos_mas_movidos
                ],
                'transacciones_por_dia': [
                    {
                        'fecha': t.fecha.isoformat(),
                        'cantidad': t.cantidad
                    } for t in transacciones_por_dia
                ]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/product/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product_transactions(product_id):
    """Obtener historial de transacciones de un producto específico"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Verificar que el producto existe
        producto = Producto.query.get(product_id)
        if not producto:
            return jsonify({'error': 'Producto no encontrado'}), 404
        
        # Obtener transacciones del producto
        transacciones = Transaccion.query.filter_by(
            producto_id=product_id
        ).order_by(
            desc(Transaccion.fecha_transaccion)
        ).paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'product': producto.to_dict(),
            'transactions': [transaccion.to_dict() for transaccion in transacciones.items],
            'total': transacciones.total,
            'pages': transacciones.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/recent', methods=['GET'])
@jwt_required()
def get_recent_transactions():
    """Obtener transacciones recientes"""
    try:
        limit = request.args.get('limit', 10, type=int)
        
        transacciones = Transaccion.query.order_by(
            desc(Transaccion.fecha_transaccion)
        ).limit(limit).all()
        
        return jsonify({
            'recent_transactions': [transaccion.to_dict() for transaccion in transacciones]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

