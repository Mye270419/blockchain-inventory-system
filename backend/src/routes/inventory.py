from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from src.models.inventory import db, Inventario, Producto, Ubicacion, Usuario

inventory_bp = Blueprint("inventory", __name__)

@inventory_bp.route("/", methods=["GET"])
@jwt_required()
def get_inventory():
    """Obtener estado del inventario con filtros opcionales"""
    try:
        # Parámetros de consulta
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        producto_id = request.args.get("producto_id", type=int)
        ubicacion_id = request.args.get("ubicacion_id", type=int)
        search = request.args.get("search", "")
        
        # Construir consulta
        query = Inventario.query.join(Producto).join(Ubicacion)
        
        # Filtros
        if producto_id:
            query = query.filter(Inventario.producto_id == producto_id)
        
        if ubicacion_id:
            query = query.filter(Inventario.ubicacion_id == ubicacion_id)
        
        if search:
            query = query.filter(
                db.or_(
                    Producto.codigo.contains(search),
                    Producto.nombre.contains(search),
                    Ubicacion.nombre.contains(search)
                )
            )
        
        # Paginación
        inventarios = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            "inventory": [inventario.to_dict() for inventario in inventarios.items],
            "total": inventarios.total,
            "pages": inventarios.pages,
            "current_page": page,
            "per_page": per_page
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@inventory_bp.route("/summary", methods=["GET"])
@jwt_required()
def get_inventory_summary():
    """Obtener resumen del inventario"""
    try:
        # Total de productos únicos
        total_productos = Producto.query.filter_by(activo=True).count()
        
        # Total de ubicaciones activas
        total_ubicaciones = Ubicacion.query.filter_by(activa=True).count()
        
        # Valor total del inventario
        valor_total = db.session.query(
            func.sum(Inventario.cantidad * Producto.precio_unitario)
        ).join(Producto).filter(
            Producto.activo == True,
            Producto.precio_unitario.isnot(None)
        ).scalar() or 0
        
        # Productos con stock bajo
        productos_bajo_stock = []
        productos = Producto.query.filter_by(activo=True).all()
        
        for producto in productos:
            stock_actual = producto.get_stock_total()
            if stock_actual <= producto.stock_minimo:
                productos_bajo_stock.append({
                    "id": producto.id,
                    "codigo": producto.codigo,
                    "nombre": producto.nombre,
                    "stock_actual": stock_actual,
                    "stock_minimo": producto.stock_minimo
                })
        
        # Top 10 productos por cantidad
        top_productos = db.session.query(
            Producto.id,
            Producto.codigo,
            Producto.nombre,
            func.sum(Inventario.cantidad).label("total_cantidad")
        ).join(Inventario).filter(
            Producto.activo == True
        ).group_by(
            Producto.id, Producto.codigo, Producto.nombre
        ).order_by(
            func.sum(Inventario.cantidad).desc()
        ).limit(10).all()
        
        return jsonify({
            "summary": {
                "total_productos": total_productos,
                "total_ubicaciones": total_ubicaciones,
                "valor_total": float(valor_total),
                "productos_bajo_stock": len(productos_bajo_stock),
                "alertas_stock": productos_bajo_stock[:5]  # Solo las primeras 5 alertas
            },
            "top_productos": [
                {
                    "id": p.id,
                    "codigo": p.codigo,
                    "nombre": p.nombre,
                    "cantidad_total": int(p.total_cantidad)
                } for p in top_productos
            ]
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@inventory_bp.route("/by-location", methods=["GET"])
@jwt_required()
def get_inventory_by_location():
    """Obtener inventario agrupado por ubicación"""
    try:
        ubicacion_id = request.args.get("ubicacion_id", type=int)
        
        query = db.session.query(
            Ubicacion.id,
            Ubicacion.nombre.label("ubicacion_nombre"),
            Producto.id.label("producto_id"),
            Producto.codigo,
            Producto.nombre.label("producto_nombre"),
            Inventario.cantidad
        ).join(Inventario).join(Producto).filter(
            Ubicacion.activa == True,
            Producto.activo == True
        )
        
        if ubicacion_id:
            query = query.filter(Ubicacion.id == ubicacion_id)
        
        resultados = query.all()
        
        # Agrupar por ubicación
        inventario_por_ubicacion = {}
        for resultado in resultados:
            ubicacion_id = resultado.id
            if ubicacion_id not in inventario_por_ubicacion:
                inventario_por_ubicacion[ubicacion_id] = {
                    "ubicacion_id": ubicacion_id,
                    "ubicacion_nombre": resultado.ubicacion_nombre,
                    "productos": []
                }
            
            inventario_por_ubicacion[ubicacion_id]["productos"].append({
                "producto_id": resultado.producto_id,
                "codigo": resultado.codigo,
                "nombre": resultado.producto_nombre,
                "cantidad": resultado.cantidad
            })
        
        return jsonify({
            "inventory_by_location": list(inventario_por_ubicacion.values())
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@inventory_bp.route("/by-product", methods=["GET"])
@jwt_required()
def get_inventory_by_product():
    """Obtener inventario agrupado por producto"""
    try:
        producto_id = request.args.get("producto_id", type=int)
        
        query = db.session.query(
            Producto.id,
            Producto.codigo,
            Producto.nombre.label("producto_nombre"),
            Ubicacion.id.label("ubicacion_id"),
            Ubicacion.nombre.label("ubicacion_nombre"),
            Inventario.cantidad
        ).join(Inventario).join(Ubicacion).filter(
            Producto.activo == True,
            Ubicacion.activa == True
        )
        
        if producto_id:
            query = query.filter(Producto.id == producto_id)
        
        resultados = query.all()
        
        # Agrupar por producto
        inventario_por_producto = {}
        for resultado in resultados:
            producto_id = resultado.id
            if producto_id not in inventario_por_producto:
                inventario_por_producto[producto_id] = {
                    "producto_id": producto_id,
                    "codigo": resultado.codigo,
                    "nombre": resultado.producto_nombre,
                    "ubicaciones": [],
                    "total_cantidad": 0
                }
            
            inventario_por_producto[producto_id]["ubicaciones"].append({
                "ubicacion_id": resultado.ubicacion_id,
                "nombre": resultado.ubicacion_nombre,
                "cantidad": resultado.cantidad
            })
            
            inventario_por_producto[producto_id]["total_cantidad"] += resultado.cantidad
        
        return jsonify({
            "inventory_by_product": list(inventario_por_producto.values())
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@inventory_bp.route("/adjust", methods=["POST"])
@jwt_required()
def adjust_inventory():
    """Ajustar inventario manualmente"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not all(k in data for k in ["producto_id", "ubicacion_id", "nueva_cantidad"]):
            return jsonify({"error": "producto_id, ubicacion_id y nueva_cantidad son requeridos"}), 400
        
        producto_id = data["producto_id"]
        ubicacion_id = data["ubicacion_id"]
        nueva_cantidad = data["nueva_cantidad"]
        
        # Verificar que el producto y ubicación existen
        producto = Producto.query.get(producto_id)
        if not producto or not producto.activo:
            return jsonify({"error": "Producto no encontrado o inactivo"}), 404
        
        ubicacion = Ubicacion.query.get(ubicacion_id)
        if not ubicacion or not ubicacion.activa:
            return jsonify({"error": "Ubicación no encontrada o inactiva"}), 404
        
        # Buscar o crear registro de inventario
        inventario = Inventario.query.filter_by(
            producto_id=producto_id,
            ubicacion_id=ubicacion_id
        ).first()
        
        if not inventario:
            inventario = Inventario(
                producto_id=producto_id,
                ubicacion_id=ubicacion_id,
                cantidad=nueva_cantidad
            )
            db.session.add(inventario)
        else:
            inventario.cantidad = nueva_cantidad
        
        db.session.commit()
        
        return jsonify({
            "message": "Inventario ajustado exitosamente",
            "inventory": inventario.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@inventory_bp.route("/locations", methods=["GET"])
@jwt_required()
def get_locations():
    """Obtener lista de ubicaciones"""
    try:
        ubicaciones = Ubicacion.query.filter_by(activa=True).all()
        
        return jsonify({
            "locations": [ubicacion.to_dict() for ubicacion in ubicaciones]
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@inventory_bp.route("/locations", methods=["POST"])
@jwt_required()
def create_location():
    """Crear nueva ubicación"""
    try:
        data = request.get_json()
        
        if not data or not data.get("nombre"):
            return jsonify({"error": "Nombre es requerido"}), 400
        
        ubicacion = Ubicacion(
            nombre=data["nombre"],
            descripcion=data.get("descripcion"),
            direccion=data.get("direccion")
        )
        
        db.session.add(ubicacion)
        db.session.commit()
        
        return jsonify({
            "message": "Ubicación creada exitosamente",
            "location": ubicacion.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@inventory_bp.route("/transfer", methods=["POST"])
@jwt_required()
def transfer_inventory():
    """Transferir inventario entre ubicaciones"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not all(k in data for k in ["producto_id", "ubicacion_origen_id", "ubicacion_destino_id", "cantidad"]):
            return jsonify({"error": "producto_id, ubicacion_origen_id, ubicacion_destino_id y cantidad son requeridos"}), 400
        
        producto_id = data["producto_id"]
        ubicacion_origen_id = data["ubicacion_origen_id"]
        ubicacion_destino_id = data["ubicacion_destino_id"]
        cantidad = data["cantidad"]
        
        if cantidad <= 0:
            return jsonify({"error": "La cantidad debe ser mayor a cero"}), 400
        
        if ubicacion_origen_id == ubicacion_destino_id:
            return jsonify({"error": "Las ubicaciones de origen y destino deben ser diferentes"}), 400
        
        # Verificar inventario en origen
        inventario_origen = Inventario.query.filter_by(
            producto_id=producto_id,
            ubicacion_id=ubicacion_origen_id
        ).first()
        
        if not inventario_origen or inventario_origen.cantidad < cantidad:
            return jsonify({"error": "Stock insuficiente en ubicación de origen"}), 400
        
        # Reducir stock en origen
        inventario_origen.cantidad -= cantidad
        
        # Buscar o crear inventario en destino
        inventario_destino = Inventario.query.filter_by(
            producto_id=producto_id,
            ubicacion_id=ubicacion_destino_id
        ).first()
        
        if not inventario_destino:
            inventario_destino = Inventario(
                producto_id=producto_id,
                ubicacion_id=ubicacion_destino_id,
                cantidad=cantidad
            )
            db.session.add(inventario_destino)
        else:
            inventario_destino.cantidad += cantidad
        
        db.session.commit()
        
        return jsonify({
            "message": "Transferencia realizada exitosamente",
            "origen": inventario_origen.to_dict(),
            "destino": inventario_destino.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



