
from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
from src.models.models import db, Usuario

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"error": "Username y password son requeridos"}), 400

        user = Usuario.query.filter_by(username=username, activo=True).first()

        if user and check_password_hash(user.password_hash, password):
            access_token = create_access_token(identity=user.id)

            return jsonify({
                "message": "Login exitoso",
                "access_token": access_token,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "rol": user.rol,
                    "nombre": user.nombre
                }
            }), 200
        else:
            return jsonify({"error": "Credenciales inválidas"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        rol = data.get("rol", "cliente")
        nombre = data.get("nombre", "")
        telefono = data.get("telefono", "")
        direccion = data.get("direccion", "")

        if not username or not email or not password:
            return jsonify({"error": "Username, email y password son requeridos"}), 400

        password_hash = generate_password_hash(password)

        try:
            new_user = Usuario(
                username=username,
                email=email,
                password_hash=password_hash,
                rol=rol,
                nombre=nombre,
                telefono=telefono,
                direccion=direccion
            )
            db.session.add(new_user)
            db.session.commit()

            return jsonify({"message": "Usuario registrado exitosamente"}), 201

        except Exception as e:
            db.session.rollback()
            if "UNIQUE constraint failed: usuarios.username" in str(e):
                return jsonify({"error": "El nombre de usuario ya existe"}), 400
            elif "UNIQUE constraint failed: usuarios.email" in str(e):
                return jsonify({"error": "El email ya está registrado"}), 400
            else:
                return jsonify({"error": "Error al registrar usuario: " + str(e)}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()

        user = Usuario.query.filter_by(id=user_id, activo=True).first()

        if user:
            return jsonify({
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "rol": user.rol,
                    "nombre": user.nombre,
                    "telefono": user.telefono,
                    "direccion": user.direccion,
                    "fecha_creacion": user.fecha_creacion.isoformat()
                }
            }), 200
        else:
            return jsonify({"error": "Usuario no encontrado"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


