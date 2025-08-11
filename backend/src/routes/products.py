from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from src.models.inventory import db, Producto, Categoria, Proveedor

products_bp = Blueprint("products", __name__)

@products_bp.route("/", methods=["GET"])
def get_products():
    """Obtener lista de productos con filtros opcionales"""
    try:
        # Parámetros de consulta
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        categoria_id = request.args.get("categoria_id", type=int)
        proveedor_id = request.args.get("proveedor_id", type=int)
        search = request.args.get("search", "")
        
        # Construir consulta
        query = Producto.query.join(Categoria).join(Proveedor)
        
        # Filtros
        if categoria_id:
            query = query.filter(Producto.categoria_id == categoria_id)
        
        if proveedor_id:
            query = query.filter(Producto.proveedor_id == proveedor_id)
        
        if search:
            query = query.filter(
                db.or_(
                    Producto.codigo.contains(search),
                    Producto.nombre.contains(search),
                    Producto.descripcion.contains(search)
                )
            )
        
        # Paginación
        productos = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            "products": [producto.to_dict() for producto in productos.items],
            "total": productos.total,
            "pages": productos.pages,
            "current_page": page,
            "per_page": per_page
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@products_bp.route("/", methods=["POST"])
def create_product():
    """Crear un nuevo producto"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ["codigo", "nombre", "precio_unitario"]):
            return jsonify({"error": "Código, nombre y precio unitario son requeridos"}), 400
        
        # Verificar si el código ya existe
        if Producto.query.filter_by(codigo=data["codigo"]).first():
            return jsonify({"error": "El código de producto ya existe"}), 400
        
        # Verificar existencia de categoría y proveedor
        if data.get("categoria_id"):
            categoria = Categoria.query.get(data["categoria_id"])
            if not categoria or not categoria.activa:
                return jsonify({"error": "Categoría no encontrada o inactiva"}), 404
        
        if data.get("proveedor_id"):
            proveedor = Proveedor.query.get(data["proveedor_id"])
            if not proveedor or not proveedor.activo:
                return jsonify({"error": "Proveedor no encontrado o inactivo"}), 404
        
        nuevo_producto = Producto(
            codigo=data["codigo"],
            nombre=data["nombre"],
            descripcion=data.get("descripcion"),
            precio_unitario=data["precio_unitario"],
            categoria_id=data.get("categoria_id"),
            proveedor_id=data.get("proveedor_id"),
            stock_minimo=data.get("stock_minimo", 0)
        )
        
        db.session.add(nuevo_producto)
        db.session.commit()
        
        return jsonify({
            "message": "Producto creado exitosamente",
            "product": nuevo_producto.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@products_bp.route("/<int:product_id>", methods=["GET"])
def get_product(product_id):
    """Obtener un producto por ID"""
    try:
        producto = Producto.query.get(product_id)
        
        if not producto:
            return jsonify({"error": "Producto no encontrado"}), 404
        
        return jsonify({"product": producto.to_dict()}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@products_bp.route("/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    """Actualizar un producto existente"""
    try:
        producto = Producto.query.get(product_id)
        
        if not producto:
            return jsonify({"error": "Producto no encontrado"}), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Datos de actualización requeridos"}), 400
        
        # Actualizar campos
        producto.codigo = data.get("codigo", producto.codigo)
        producto.nombre = data.get("nombre", producto.nombre)
        producto.descripcion = data.get("descripcion", producto.descripcion)
        producto.precio_unitario = data.get("precio_unitario", producto.precio_unitario)
        producto.stock_minimo = data.get("stock_minimo", producto.stock_minimo)
        producto.activo = data.get("activo", producto.activo)
        
        # Actualizar categoría y proveedor si se proporcionan
        if "categoria_id" in data:
            if data["categoria_id"] is None:
                producto.categoria_id = None
            else:
                categoria = Categoria.query.get(data["categoria_id"])
                if not categoria or not categoria.activa:
                    return jsonify({"error": "Categoría no encontrada o inactiva"}), 404
                producto.categoria_id = data["categoria_id"]
        
        if "proveedor_id" in data:
            if data["proveedor_id"] is None:
                producto.proveedor_id = None
            else:
                proveedor = Proveedor.query.get(data["proveedor_id"])
                if not proveedor or not proveedor.activo:
                    return jsonify({"error": "Proveedor no encontrado o inactiva"}), 404
                producto.proveedor_id = data["proveedor_id"]
        
        db.session.commit()
        
        return jsonify({
            "message": "Producto actualizado exitosamente",
            "product": producto.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@products_bp.route("/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    """Eliminar un producto (desactivar)"""
    try:
        producto = Producto.query.get(product_id)
        
        if not producto:
            return jsonify({"error": "Producto no encontrado"}), 404
        
        producto.activo = False  # Desactivar en lugar de eliminar
        db.session.commit()
        
        return jsonify({"message": "Producto desactivado exitosamente"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@products_bp.route("/categories", methods=["GET"])
def get_categories():
    """Obtener lista de categorías"""
    try:
        categorias = Categoria.query.filter_by(activa=True).all()
        
        return jsonify({
            "categories": [categoria.to_dict() for categoria in categorias]
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@products_bp.route("/categories", methods=["POST"])
def create_category():
    """Crear nueva categoría"""
    try:
        data = request.get_json()
        
        if not data or not data.get("nombre"):
            return jsonify({"error": "Nombre es requerido"}), 400
        
        categoria = Categoria(
            nombre=data["nombre"],
            descripcion=data.get("descripcion")
        )
        
        db.session.add(categoria)
        db.session.commit()
        
        return jsonify({
            "message": "Categoría creada exitosamente",
            "category": categoria.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@products_bp.route("/suppliers", methods=["GET"])
def get_suppliers():
    """Obtener lista de proveedores"""
    try:
        proveedores = Proveedor.query.filter_by(activo=True).all()
        
        return jsonify({
            "suppliers": [proveedor.to_dict() for proveedor in proveedores]
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@products_bp.route("/suppliers", methods=["POST"])
def create_supplier():
    """Crear nuevo proveedor"""
    try:
        data = request.get_json()
        
        if not data or not data.get("nombre"):
            return jsonify({"error": "Nombre es requerido"}), 400
        
        proveedor = Proveedor(
            nombre=data["nombre"],
            contacto=data.get("contacto"),
            telefono=data.get("telefono"),
            email=data.get("email")
        )
        
        db.session.add(proveedor)
        db.session.commit()
        
        return jsonify({
            "message": "Proveedor creado exitosamente",
            "supplier": proveedor.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



