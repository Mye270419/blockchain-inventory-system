from flask import Blueprint, request, jsonify
from src.models.inventory import db, Usuario

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/profile", methods=["GET"])
def get_profile():
    """Obtener perfil del usuario actual (sin autenticación)"""
    try:
        # Para un sistema sin autenticación, podríamos devolver un usuario por defecto o el primero que exista
        # O simplemente un mensaje indicando que no hay perfil de usuario logueado
        # Por ahora, devolveremos un mensaje simple.
        return jsonify({'message': 'No se requiere autenticación para acceder al perfil.'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route("/logout", methods=["POST"])
def logout():
    """Cerrar sesión (sin autenticación, solo un mensaje)"""
    return jsonify({'message': 'Sesión cerrada exitosamente (autenticación deshabilitada)'}), 200


