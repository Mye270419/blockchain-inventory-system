from flask import Flask, jsonify, request
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # Permitir solicitudes CORS desde cualquier origen

# Datos simulados para el inventario (en una aplicación real, esto sería una base de datos)
inventory_data = {
    "products": [
        {"id": 1, "codigo": "PROD001", "nombre": "Producto 1", "precio_unitario": 10.50, "stock": 100},
        {"id": 2, "codigo": "PROD002", "nombre": "Producto 2", "precio_unitario": 25.00, "stock": 50},
        {"id": 3, "codigo": "PROD003", "nombre": "Producto 3", "precio_unitario": 15.75, "stock": 75}
    ],
    "locations": [
        {"id": 1, "nombre": "Almacén Principal", "descripcion": "Almacén central"},
        {"id": 2, "nombre": "Almacén Secundario", "descripcion": "Almacén de respaldo"}
    ],
    "transactions": [
        {"id": 1, "producto_id": 1, "tipo": "Entrada", "cantidad": 50, "fecha": "2025-08-25"},
        {"id": 2, "producto_id": 2, "tipo": "Salida", "cantidad": 10, "fecha": "2025-08-25"}
    ]
}

@app.route('/')
def home():
    return jsonify({"message": "Sistema de Inventario Blockchain - API funcionando correctamente"})

@app.route('/api/inventory/summary', methods=['GET'])
def get_inventory_summary():
    """Obtener resumen del inventario"""
    try:
        total_productos = len(inventory_data["products"])
        total_ubicaciones = len(inventory_data["locations"])
        valor_total = sum(p["precio_unitario"] * p["stock"] for p in inventory_data["products"])
        
        return jsonify({
            "summary": {
                "total_productos": total_productos,
                "total_ubicaciones": total_ubicaciones,
                "valor_total": valor_total,
                "productos_bajo_stock": 0,
                "alertas_stock": []
            },
            "top_productos": inventory_data["products"][:5]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/products', methods=['GET'])
def get_products():
    """Obtener lista de productos"""
    try:
        return jsonify({
            "products": inventory_data["products"]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/products', methods=['POST'])
def create_product():
    """Crear un nuevo producto"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ["codigo", "nombre", "precio_unitario"]):
            return jsonify({"error": "Código, nombre y precio unitario son requeridos"}), 400
        
        new_id = max([p["id"] for p in inventory_data["products"]], default=0) + 1
        new_product = {
            "id": new_id,
            "codigo": data["codigo"],
            "nombre": data["nombre"],
            "precio_unitario": data["precio_unitario"],
            "stock": data.get("stock", 0)
        }
        
        inventory_data["products"].append(new_product)
        
        return jsonify({
            "message": "Producto creado exitosamente",
            "product": new_product
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/inventory/locations', methods=['GET'])
def get_locations():
    """Obtener lista de ubicaciones"""
    try:
        return jsonify({
            "locations": inventory_data["locations"]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Obtener lista de transacciones"""
    try:
        return jsonify({
            "transactions": inventory_data["transactions"]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    """Crear una nueva transacción"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ["producto_id", "tipo", "cantidad"]):
            return jsonify({"error": "producto_id, tipo y cantidad son requeridos"}), 400
        
        new_id = max([t["id"] for t in inventory_data["transactions"]], default=0) + 1
        new_transaction = {
            "id": new_id,
            "producto_id": data["producto_id"],
            "tipo": data["tipo"],
            "cantidad": data["cantidad"],
            "fecha": "2025-08-25"
        }
        
        inventory_data["transactions"].append(new_transaction)
        
        return jsonify({
            "message": "Transacción creada exitosamente",
            "transaction": new_transaction
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

