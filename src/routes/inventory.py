
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.models import db, Inventario, Producto, Ubicacion, TipoTransaccion, Transaccion, Usuario

inventory_bp = Blueprint("inventory", __name__)

@inventory_bp.route("/inventory/summary", methods=["GET"])
def get_inventory_summary():
    try:
        total_productos = Producto.query.filter_by(activo=True).count()
        total_ubicaciones = Ubicacion.query.filter_by(activo=True).count()

        valor_total = db.session.query(db.func.sum(Producto.precio_venta * Inventario.cantidad)).\
            join(Inventario, Producto.id == Inventario.producto_id).\
            filter(Producto.activo == True).scalar() or 0

        productos_bajo_stock = db.session.query(Producto).\
            join(Inventario, Producto.id == Inventario.producto_id).\
            group_by(Producto.id).\
            having(db.func.sum(Inventario.cantidad) <= Producto.stock_minimo, Producto.stock_minimo > 0).count()

        top_productos = db.session.query(Producto.id, Producto.codigo, Producto.nombre, Producto.precio_venta, db.func.sum(Inventario.cantidad).label("stock_total")).\
            outerjoin(Inventario, Producto.id == Inventario.producto_id).\
            filter(Producto.activo == True).\
            group_by(Producto.id).\
            order_by(db.func.sum(Inventario.cantidad).desc()).\
            limit(5).all()

        return jsonify({
            "summary": {
                "total_productos": total_productos,
                "total_ubicaciones": total_ubicaciones,
                "valor_total": float(valor_total),
                "productos_bajo_stock": productos_bajo_stock,
                "alertas_stock": []
            },
            "top_productos": [{
                "id": p.id,
                "codigo": p.codigo,
                "nombre": p.nombre,
                "precio_venta": float(p.precio_venta) if p.precio_venta else None,
                "stock_total": p.stock_total
            } for p in top_productos]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@inventory_bp.route("/inventory/locations", methods=["GET"])
def get_locations():
    try:
        locations = Ubicacion.query.filter_by(activo=True).order_by(Ubicacion.nombre).all()
        return jsonify({"locations": [{
            "id": loc.id,
            "nombre": loc.nombre,
            "descripcion": loc.descripcion,
            "direccion": loc.direccion,
            "fecha_creacion": loc.fecha_creacion.isoformat()
        } for loc in locations]}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@inventory_bp.route("/transactions", methods=["GET"])
@jwt_required()
def get_transactions():
    try:
        transactions = db.session.query(Transaccion, Producto.codigo.label("producto_codigo"), Producto.nombre.label("producto_nombre"),
                                        Ubicacion.nombre.label("ubicacion_nombre"), TipoTransaccion.nombre.label("tipo_nombre"),
                                        Usuario.username.label("usuario_nombre")).\
            join(Producto, Transaccion.producto_id == Producto.id).\
            join(Ubicacion, Transaccion.ubicacion_id == Ubicacion.id).\
            join(TipoTransaccion, Transaccion.tipo_transaccion_id == TipoTransaccion.id).\
            join(Usuario, Transaccion.usuario_id == Usuario.id).\
            order_by(Transaccion.fecha_creacion.desc()).\
            limit(50).all()

        return jsonify({"transactions": [{
            "id": t.Transaccion.id,
            "producto_id": t.Transaccion.producto_id,
            "ubicacion_id": t.Transaccion.ubicacion_id,
            "tipo_transaccion_id": t.Transaccion.tipo_transaccion_id,
            "cantidad": t.Transaccion.cantidad,
            "precio_unitario": float(t.Transaccion.precio_unitario) if t.Transaccion.precio_unitario else None,
            "total": float(t.Transaccion.total) if t.Transaccion.total else None,
            "referencia": t.Transaccion.referencia,
            "observaciones": t.Transaccion.observaciones,
            "usuario_id": t.Transaccion.usuario_id,
            "blockchain_tx_hash": t.Transaccion.blockchain_tx_hash,
            "blockchain_confirmado": t.Transaccion.blockchain_confirmado,
            "fecha_creacion": t.Transaccion.fecha_creacion.isoformat(),
            "producto_codigo": t.producto_codigo,
            "producto_nombre": t.producto_nombre,
            "ubicacion_nombre": t.ubicacion_nombre,
            "tipo_nombre": t.tipo_nombre,
            "usuario_nombre": t.usuario_nombre
        } for t in transactions]}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@inventory_bp.route("/transactions", methods=["POST"])
@jwt_required()
def create_transaction():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        new_transaction = Transaccion(
            producto_id=data.get("producto_id"),
            ubicacion_id=data.get("ubicacion_id"),
            tipo_transaccion_id=data.get("tipo_transaccion_id"),
            cantidad=data.get("cantidad"),
            precio_unitario=data.get("precio_unitario"),
            total=data.get("total", data.get("precio_unitario", 0) * data.get("cantidad", 0)),
            referencia=data.get("referencia", ""),
            observaciones=data.get("observaciones", ""),
            usuario_id=user_id
        )
        db.session.add(new_transaction)
        db.session.flush()  # Para obtener el ID de la transacción antes del commit

        # Actualizar inventario
        tipo_transaccion = TipoTransaccion.query.get(data.get("tipo_transaccion_id"))

        if tipo_transaccion:
            cantidad_cambio = data.get("cantidad") if tipo_transaccion.tipo == "entrada" else -data.get("cantidad")

            inventario_item = Inventario.query.filter_by(
                producto_id=data.get("producto_id"),
                ubicacion_id=data.get("ubicacion_id")
            ).first()

            if inventario_item:
                inventario_item.cantidad += cantidad_cambio
                inventario_item.fecha_actualizacion = datetime.utcnow()
            else:
                new_inventario_item = Inventario(
                    producto_id=data.get("producto_id"),
                    ubicacion_id=data.get("ubicacion_id"),
                    cantidad=max(0, cantidad_cambio) # Asegura que la cantidad no sea negativa al inicio
                )
                db.session.add(new_inventario_item)
        db.session.commit()

        return jsonify({
            "message": "Transacción registrada exitosamente",
            "transaction_id": new_transaction.id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


