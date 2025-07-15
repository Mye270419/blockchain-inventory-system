from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import json

from src.models.inventory import db, Producto, Transaccion, AuditoriaBlockchain
from src.services.blockchain_service import blockchain_service

blockchain_bp = Blueprint('blockchain', __name__)

@blockchain_bp.route('/products/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product_blockchain_info(product_id):
    """Obtener información blockchain de un producto"""
    try:
        producto = Producto.query.get(product_id)
        
        if not producto:
            return jsonify({'error': 'Producto no encontrado'}), 404
        
        # Obtener auditoría blockchain del producto
        auditoria = AuditoriaBlockchain.query.filter_by(
            tabla_afectada='productos',
            registro_id=product_id
        ).order_by(AuditoriaBlockchain.fecha_evento.desc()).all()
        
        return jsonify({
            'product': producto.to_dict(),
            'blockchain_hash': producto.blockchain_hash,
            'data_hash': producto.generate_data_hash(),
            'audit_trail': [audit.to_dict() for audit in auditoria]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blockchain_bp.route('/transactions/<int:transaction_id>', methods=['GET'])
@jwt_required()
def get_transaction_blockchain_info(transaction_id):
    """Obtener información blockchain de una transacción"""
    try:
        transaccion = Transaccion.query.get(transaction_id)
        
        if not transaccion:
            return jsonify({'error': 'Transacción no encontrada'}), 404
        
        # Obtener auditoría blockchain de la transacción
        auditoria = AuditoriaBlockchain.query.filter_by(
            tabla_afectada='transacciones',
            registro_id=transaction_id
        ).order_by(AuditoriaBlockchain.fecha_evento.desc()).all()
        
        return jsonify({
            'transaction': transaccion.to_dict(),
            'blockchain_tx_hash': transaccion.blockchain_tx_hash,
            'blockchain_confirmado': transaccion.blockchain_confirmado,
            'data_hash': transaccion.generate_data_hash(),
            'audit_trail': [audit.to_dict() for audit in auditoria]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blockchain_bp.route('/verify', methods=['POST'])
@jwt_required()
def verify_data_integrity():
    """Verificar integridad de datos comparando con blockchain"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['table', 'record_id']):
            return jsonify({'error': 'table y record_id son requeridos'}), 400
        
        table = data['table']
        record_id = data['record_id']
        
        if table == 'productos':
            producto = Producto.query.get(record_id)
            if not producto:
                return jsonify({'error': 'Producto no encontrado'}), 404
            
            current_hash = producto.generate_data_hash()
            blockchain_hash = producto.blockchain_hash
            
            return jsonify({
                'table': table,
                'record_id': record_id,
                'current_hash': current_hash,
                'blockchain_hash': blockchain_hash,
                'integrity_verified': current_hash == blockchain_hash,
                'data': producto.to_dict()
            }), 200
            
        elif table == 'transacciones':
            transaccion = Transaccion.query.get(record_id)
            if not transaccion:
                return jsonify({'error': 'Transacción no encontrada'}), 404
            
            current_hash = transaccion.generate_data_hash()
            # Para transacciones, el hash se almacena en la auditoría blockchain
            auditoria = AuditoriaBlockchain.query.filter_by(
                tabla_afectada='transacciones',
                registro_id=record_id
            ).first()
            
            blockchain_hash = auditoria.blockchain_tx_hash if auditoria else None
            
            return jsonify({
                'table': table,
                'record_id': record_id,
                'current_hash': current_hash,
                'blockchain_hash': blockchain_hash,
                'blockchain_confirmed': transaccion.blockchain_confirmado,
                'integrity_verified': blockchain_hash is not None,
                'data': transaccion.to_dict()
            }), 200
            
        else:
            return jsonify({'error': 'Tabla no soportada para verificación'}), 400
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blockchain_bp.route('/audit', methods=['GET'])
@jwt_required()
def get_audit_trail():
    """Obtener registro de auditoría blockchain"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        table = request.args.get('table')
        record_id = request.args.get('record_id', type=int)
        confirmado = request.args.get('confirmado', type=bool)
        
        # Construir consulta
        query = AuditoriaBlockchain.query
        
        if table:
            query = query.filter_by(tabla_afectada=table)
        
        if record_id:
            query = query.filter_by(registro_id=record_id)
        
        if confirmado is not None:
            query = query.filter_by(confirmado=confirmado)
        
        # Ordenar por fecha descendente
        query = query.order_by(AuditoriaBlockchain.fecha_evento.desc())
        
        # Paginación
        auditoria = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'audit_trail': [audit.to_dict() for audit in auditoria.items],
            'total': auditoria.total,
            'pages': auditoria.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blockchain_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_blockchain_stats():
    """Obtener estadísticas de blockchain"""
    try:
        # Total de productos registrados en blockchain
        productos_blockchain = Producto.query.filter(
            Producto.blockchain_hash.isnot(None)
        ).count()
        
        # Total de transacciones confirmadas en blockchain
        transacciones_confirmadas = Transaccion.query.filter_by(
            blockchain_confirmado=True
        ).count()
        
        # Total de registros de auditoría
        total_auditoria = AuditoriaBlockchain.query.count()
        
        # Registros pendientes de confirmación
        auditoria_pendiente = AuditoriaBlockchain.query.filter_by(
            confirmado=False
        ).count()
        
        # Últimas actividades blockchain
        ultimas_actividades = AuditoriaBlockchain.query.order_by(
            AuditoriaBlockchain.fecha_evento.desc()
        ).limit(10).all()
        
        return jsonify({
            'stats': {
                'productos_en_blockchain': productos_blockchain,
                'transacciones_confirmadas': transacciones_confirmadas,
                'total_registros_auditoria': total_auditoria,
                'registros_pendientes': auditoria_pendiente
            },
            'recent_activity': [actividad.to_dict() for actividad in ultimas_actividades]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blockchain_bp.route('/sync-status', methods=['GET'])
@jwt_required()
def get_sync_status():
    """Obtener estado de sincronización con blockchain"""
    try:
        # Productos sin hash blockchain
        productos_sin_blockchain = Producto.query.filter(
            Producto.blockchain_hash.is_(None),
            Producto.activo == True
        ).count()
        
        # Transacciones no confirmadas
        transacciones_no_confirmadas = Transaccion.query.filter_by(
            blockchain_confirmado=False
        ).count()
        
        # Registros de auditoría no confirmados
        auditoria_no_confirmada = AuditoriaBlockchain.query.filter_by(
            confirmado=False
        ).count()
        
        # Calcular porcentaje de sincronización
        total_productos = Producto.query.filter_by(activo=True).count()
        total_transacciones = Transaccion.query.count()
        
        sync_productos = ((total_productos - productos_sin_blockchain) / total_productos * 100) if total_productos > 0 else 100
        sync_transacciones = ((total_transacciones - transacciones_no_confirmadas) / total_transacciones * 100) if total_transacciones > 0 else 100
        
        return jsonify({
            'sync_status': {
                'productos_sin_blockchain': productos_sin_blockchain,
                'transacciones_no_confirmadas': transacciones_no_confirmadas,
                'auditoria_no_confirmada': auditoria_no_confirmada,
                'porcentaje_sync_productos': round(sync_productos, 2),
                'porcentaje_sync_transacciones': round(sync_transacciones, 2),
                'sync_general': round((sync_productos + sync_transacciones) / 2, 2)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blockchain_bp.route('/register-product', methods=['POST'])
@jwt_required()
def register_product_blockchain():
    """Registrar producto en blockchain (placeholder para integración futura)"""
    try:
        data = request.get_json()
        
        if not data or not data.get('product_id'):
            return jsonify({'error': 'product_id es requerido'}), 400
        
        product_id = data['product_id']
        producto = Producto.query.get(product_id)
        
        if not producto:
            return jsonify({'error': 'Producto no encontrado'}), 404
        
        # TODO: Implementar integración real con smart contract
        # Por ahora, simular registro exitoso
        data_hash = producto.generate_data_hash()
        
        # Crear registro de auditoría
        auditoria = AuditoriaBlockchain(
            tabla_afectada='productos',
            registro_id=product_id,
            accion='REGISTER',
            datos_nuevos=json.dumps(producto.to_dict()),
            blockchain_tx_hash=f"0x{data_hash[:64]}",  # Simular hash de transacción
            confirmado=True
        )
        
        db.session.add(auditoria)
        
        # Actualizar producto con hash blockchain
        producto.blockchain_hash = auditoria.blockchain_tx_hash
        
        db.session.commit()
        
        return jsonify({
            'message': 'Producto registrado en blockchain exitosamente',
            'blockchain_tx_hash': auditoria.blockchain_tx_hash,
            'data_hash': data_hash
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500



@blockchain_bp.route('/network-info', methods=['GET'])
@jwt_required()
def get_network_info():
    """Obtener información de la red blockchain"""
    try:
        network_info = blockchain_service.get_network_info()
        contract_stats = blockchain_service.get_contract_stats()
        
        return jsonify({
            'network': network_info,
            'contract_stats': contract_stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

