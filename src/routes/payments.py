
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from src.models.models import db, Pago, Pedido
from datetime import datetime
import uuid

payments_bp = Blueprint("payments", __name__)

@payments_bp.route("/payments", methods=["POST"])
@jwt_required()
def create_payment():
    try:
        data = request.get_json()

        qr_code = None
        if data.get("metodo_pago") == "qr":
            qr_code = f"QR-{str(uuid.uuid4())[:12].upper()}"

        new_payment = Pago(
            pedido_id=data.get("pedido_id"),
            metodo_pago=data.get("metodo_pago"),
            monto=data.get("monto"),
            referencia_pago=data.get("referencia_pago", ""),
            qr_code=qr_code
        )
        db.session.add(new_payment)

        pedido = Pedido.query.get(data.get("pedido_id"))
        if pedido:
            pedido.estado = "pagado"

        db.session.commit()

        response_data = {
            "message": "Pago procesado exitosamente",
            "payment_id": new_payment.id
        }

        if qr_code:
            response_data["qr_code"] = qr_code

        return jsonify(response_data), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@payments_bp.route("/payments/methods", methods=["GET"])
def get_payment_methods():
    return jsonify({
        "methods": [
            {"id": "efectivo", "nombre": "Efectivo", "descripcion": "Pago en efectivo"},
            {"id": "tarjeta", "nombre": "Tarjeta", "descripcion": "Pago con tarjeta de crédito/débito"},
            {"id": "qr", "nombre": "Código QR", "descripcion": "Pago mediante código QR"},
            {"id": "transferencia", "nombre": "Transferencia", "descripcion": "Transferencia bancaria"}
        ]
    }), 200


