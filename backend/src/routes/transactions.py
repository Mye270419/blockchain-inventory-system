from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from src.models.inventory import db, Transaccion, Producto, Ubicacion, TipoTransaccion, Usuario, Inventario, AuditoriaBlockchain
from src.services.blockchain_service import BlockchainService

transactions_bp = Blueprint("transactions", __name__)

@transactions_bp.route("/", methods=["GET"])
def get_transactions():
    """Obtener lista de transacciones con filtros opcionales"""
    try:
        # Parámetros de consulta
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        producto_id = request.args.get("producto_id", type=int)
        ubicacion_id = request.args.get("ubicacion_id", type=int)
        tipo_transaccion_id = request.args.get("tipo_transaccion_id", type=int)
        usuario_id = request.args.get("usuario_id", type=int)
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        
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
        
        if start_date:
            query = query.filter(Transaccion.fecha_transaccion >= datetime.fromisoformat(start_date))
        
        if end_date:
            query = query.filter(Transaccion.fecha_transaccion <= datetime.fromisoformat(end_date))
        
        # Paginación
        transacciones = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            "transactions": [transaccion.to_dict() for transaccion in transacciones.items],
            "total": transacciones.total,
            "pages": transacciones.pages,
            "current_page": page,
            "per_page": per_page
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@transactions_bp.route("/", methods=["POST"])
def create_transaction():
    """Crear una nueva transacción y actualizar inventario"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not all(k in data for k in ["producto_id", "ubicacion_id", "tipo_transaccion_id", "cantidad"]):
            return jsonify({"error": "producto_id, ubicacion_id, tipo_transaccion_id y cantidad son requeridos"}), 400
        
        producto_id = data["producto_id"]
        ubicacion_id = data["ubicacion_id"]
        tipo_transaccion_id = data["tipo_transaccion_id"]
        cantidad = data["cantidad"]
        
        if cantidad <= 0:
            return jsonify({"error": "La cantidad debe ser mayor a cero"}), 400
        
        # Validar existencia de entidades
        producto = Producto.query.get(producto_id)
        if not producto or not producto.activo:
            return jsonify({"error": "Producto no encontrado o inactivo"}), 404
        
        ubicacion = Ubicacion.query.get(ubicacion_id)
        if not ubicacion or not ubicacion.activa:
            return jsonify({"error": "Ubicación no encontrada o inactiva"}), 404
        
        tipo_transaccion = TipoTransaccion.query.get(tipo_transaccion_id)
        if not tipo_transaccion:
            return jsonify({"error": "Tipo de transacción no encontrado"}), 404
        
        # Actualizar inventario
        inventario = Inventario.query.filter_by(
            producto_id=producto_id,
            ubicacion_id=ubicacion_id
        ).first()
        
        if tipo_transaccion.es_entrada:
            if not inventario:
                inventario = Inventario(
                    producto_id=producto_id,
                    ubicacion_id=ubicacion_id,
                    cantidad=cantidad
                )
                db.session.add(inventario)
            else:
                inventario.cantidad += cantidad
        else: # Es salida
            if not inventario or inventario.cantidad < cantidad:
                return jsonify({"error": "Stock insuficiente para esta transacción"}), 400
            inventario.cantidad -= cantidad
        
        # Crear transacción
        nueva_transaccion = Transaccion(
            producto_id=producto_id,
            ubicacion_id=ubicacion_id,
            tipo_transaccion_id=tipo_transaccion_id,
            cantidad=cantidad,
            usuario_id=current_user_id,
            comentarios=data.get("comentarios")
        )
        db.session.add(nueva_transaccion)
        db.session.flush() # Para obtener el ID de la transacción antes del commit
        
        # Registrar en blockchain
        blockchain_service = BlockchainService()
        tx_hash = blockchain_service.add_transaction_to_blockchain(
            nueva_transaccion.id,
            producto.codigo,
            ubicacion.nombre,
            tipo_transaccion.nombre,
            cantidad,
            current_user_id
        )
        
        auditoria = AuditoriaBlockchain(
            transaccion_id=nueva_transaccion.id,
            hash_transaccion=tx_hash,
            hash_bloque="PENDIENTE" # Esto se actualizará una vez minado
        )
        db.session.add(auditoria)
        
        db.session.commit()
        
        return jsonify({
            "message": "Transacción creada y inventario actualizado exitosamente",
            "transaction": nueva_transaccion.to_dict(),
            "blockchain_tx_hash": tx_hash
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@transactions_bp.route("/types", methods=["GET"])
def get_transaction_types():
    """Obtener lista de tipos de transacción"""
    try:
        tipos = TipoTransaccion.query.all()
        return jsonify({"transaction_types": [t.to_dict() for t in tipos]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@transactions_bp.route("/types", methods=["POST"])
def create_transaction_type():
    """Crear un nuevo tipo de transacción"""
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ["nombre", "es_entrada"]):
            return jsonify({"error": "Nombre y es_entrada son requeridos"}), 400
        
        nuevo_tipo = TipoTransaccion(
            nombre=data["nombre"],
            descripcion=data.get("descripcion"),
            es_entrada=data["es_entrada"]
        )
        db.session.add(nuevo_tipo)
        db.session.commit()
        return jsonify({"message": "Tipo de transacción creado exitosamente", "type": nuevo_tipo.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



