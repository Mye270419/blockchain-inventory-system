
from flask import Blueprint, jsonify
from src.models.models import Categoria

categories_bp = Blueprint("categories", __name__)

@categories_bp.route("/categories", methods=["GET"])
def get_categories():
    try:
        categories = Categoria.query.filter_by(activo=True).order_by(Categoria.nombre).all()
        return jsonify({"categories": [{
            "id": cat.id,
            "nombre": cat.nombre,
            "descripcion": cat.descripcion,
            "fecha_creacion": cat.fecha_creacion.isoformat()
        } for cat in categories]}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


