
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.models import db, Pedido, DetallePedido, Producto, Inventario, Usuario
from datetime import datetime
import uuid

orders_bp = Blueprint("orders", __name__)

@orders_bp.route("/orders", methods=["POST"])
@jwt_required()
def create_order():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        numero_pedido = f"PED-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

        new_order = Pedido(
            numero_pedido=numero_pedido,
            cliente_id=user_id,
            subtotal=data.get("subtotal"),
            impuestos=data.get("impuestos", 0),
            total=data.get("total"),
            direccion_entrega=data.get("direccion_entrega", ""),
            telefono_contacto=data.get("telefono_contacto", ""),
            observaciones=data.get("observaciones", "")
        )
        db.session.add(new_order)
        db.session.flush() # Get the ID before commit

        for item in data.get("items", []):
            new_detail = DetallePedido(
                pedido_id=new_order.id,
                producto_id=item.get("producto_id"),
                cantidad=item.get("cantidad"),
                precio_unitario=item.get("precio_unitario"),
                subtotal=item.get("subtotal")
            )
            db.session.add(new_detail)

            # Update inventory (reduce stock)
            inventario_item = Inventario.query.filter_by(
                producto_id=item.get("producto_id"),
                ubicacion_id=1 # Assuming main warehouse for now
            ).first()

            if inventario_item:
                inventario_item.cantidad -= item.get("cantidad")
                inventario_item.fecha_actualizacion = datetime.utcnow()
            else:
                # Handle case where product is not in inventory (e.g., error or add to inventory with negative stock)
                pass # For now, just pass. Could raise an error or log.

        db.session.commit()

        return jsonify({
            "message": "Pedido creado exitosamente",
            "pedido_id": new_order.id,
            "numero_pedido": numero_pedido
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@orders_bp.route("/orders/user/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user_orders(user_id):
    try:
        current_user_id = get_jwt_identity()
        user_role = db.session.query(Usuario.rol).filter(Usuario.id == current_user_id).scalar()

        if user_role not in ["administrador", "empleado"] and current_user_id != user_id:
            return jsonify({"error": "Permisos insuficientes"}), 403

        orders = Pedido.query.filter_by(cliente_id=user_id).order_by(Pedido.fecha_pedido.desc()).all()

        return jsonify({"orders": [{
            "id": o.id,
            "numero_pedido": o.numero_pedido,
            "cliente_id": o.cliente_id,
            "estado": o.estado,
            "subtotal": float(o.subtotal),
            "impuestos": float(o.impuestos),
            "total": float(o.total),
            "direccion_entrega": o.direccion_entrega,
            "telefono_contacto": o.telefono_contacto,
            "observaciones": o.observaciones,
            "fecha_pedido": o.fecha_pedido.isoformat(),
            "fecha_entrega": o.fecha_entrega.isoformat() if o.fecha_entrega else None
        } for o in orders]}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


