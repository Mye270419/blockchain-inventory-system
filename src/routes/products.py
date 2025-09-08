
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.models import db, Producto, Categoria, Usuario, Inventario

products_bp = Blueprint("products", __name__)

@products_bp.route("/products", methods=["GET"])
def get_products():
    try:
        search = request.args.get("search", "")
        category_id = request.args.get("category_id", "")
        available_only = request.args.get("available_only", "false").lower() == "true"

        query = db.session.query(Producto, Categoria.nombre.label("categoria_nombre"))\
            .join(Categoria, Producto.categoria_id == Categoria.id)

        if search:
            query = query.filter(Producto.nombre.like(f"%{search}%") | Producto.descripcion.like(f"%{search}%"))
        if category_id:
            query = query.filter(Producto.categoria_id == category_id)
        if available_only:
            query = query.filter(Producto.disponible_venta == True)

        products = []
        for product, categoria_nombre in query.filter(Producto.activo == True).all():
            stock_total = db.session.query(db.func.sum(Inventario.cantidad)).filter(Inventario.producto_id == product.id).scalar() or 0
            products.append({
                "id": product.id,
                "codigo": product.codigo,
                "nombre": product.nombre,
                "descripcion": product.descripcion,
                "categoria_id": product.categoria_id,
                "categoria_nombre": categoria_nombre,
                "precio_unitario": float(product.precio_unitario),
                "precio_venta": float(product.precio_venta) if product.precio_venta else None,
                "unidad_medida": product.unidad_medida,
                "stock_minimo": product.stock_minimo,
                "stock_total": stock_total,
                "imagen_url": product.imagen_url,
                "disponible_venta": product.disponible_venta,
                "fecha_creacion": product.fecha_creacion.isoformat()
            })

        return jsonify({"products": products}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@products_bp.route("/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    try:
        product = db.session.query(Producto, Categoria.nombre.label("categoria_nombre"))\
            .join(Categoria, Producto.categoria_id == Categoria.id)\
            .filter(Producto.id == product_id, Producto.activo == True).first()

        if product:
            product_data, categoria_nombre = product
            stock_total = db.session.query(db.func.sum(Inventario.cantidad)).filter(Inventario.producto_id == product_data.id).scalar() or 0
            return jsonify({
                "product": {
                    "id": product_data.id,
                    "codigo": product_data.codigo,
                    "nombre": product_data.nombre,
                    "descripcion": product_data.descripcion,
                    "categoria_id": product_data.categoria_id,
                    "categoria_nombre": categoria_nombre,
                    "precio_unitario": float(product_data.precio_unitario),
                    "precio_venta": float(product_data.precio_venta) if product_data.precio_venta else None,
                    "unidad_medida": product_data.unidad_medida,
                    "stock_minimo": product_data.stock_minimo,
                    "stock_total": stock_total,
                    "imagen_url": product_data.imagen_url,
                    "disponible_venta": product_data.disponible_venta,
                    "fecha_creacion": product_data.fecha_creacion.isoformat()
                }
            }), 200
        else:
            return jsonify({"error": "Producto no encontrado"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@products_bp.route("/products", methods=["POST"])
@jwt_required()
def create_product():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        user_role = db.session.query(Usuario.rol).filter(Usuario.id == user_id).scalar()

        if not user_role or user_role not in ["administrador", "empleado"]:
            return jsonify({"error": "Permisos insuficientes"}), 403

        new_product = Producto(
            codigo=data.get("codigo"),
            nombre=data.get("nombre"),
            descripcion=data.get("descripcion", ""),
            categoria_id=data.get("categoria_id"),
            precio_unitario=data.get("precio_unitario"),
            precio_venta=data.get("precio_venta", data.get("precio_unitario")),
            unidad_medida=data.get("unidad_medida", "pcs"),
            stock_minimo=data.get("stock_minimo", 0),
            imagen_url=data.get("imagen_url", ""),
            disponible_venta=data.get("disponible_venta", True)
        )
        db.session.add(new_product)
        db.session.commit()

        return jsonify({
            "message": "Producto creado exitosamente",
            "product_id": new_product.id
        }), 201

    except Exception as e:
        db.session.rollback()
        if "UNIQUE constraint failed: productos.codigo" in str(e):
            return jsonify({"error": "El código del producto ya existe"}), 400
        return jsonify({"error": str(e)}), 500


