from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
import bcrypt

from src.models.inventory import db, Usuario

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Iniciar sesión de usuario"""
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username y password son requeridos'}), 400
        
        username = data['username']
        password = data['password']
        
        # Buscar usuario
        usuario = Usuario.query.filter_by(username=username).first()
        
        if not usuario or not usuario.activo:
            return jsonify({'error': 'Credenciales inválidas'}), 401
        
        # Verificar password
        if not bcrypt.checkpw(password.encode('utf-8'), usuario.password_hash.encode('utf-8')):
            return jsonify({'error': 'Credenciales inválidas'}), 401
        
        # Actualizar última conexión
        usuario.ultima_conexion = datetime.utcnow()
        db.session.commit()
        
        # Crear token JWT
        access_token = create_access_token(
            identity=usuario.id,
            additional_claims={
                'username': usuario.username,
                'rol': usuario.rol
            }
        )
        
        return jsonify({
            'access_token': access_token,
            'user': usuario.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/register', methods=['POST'])
@jwt_required()
def register():
    """Registrar nuevo usuario (solo administradores)"""
    try:
        # Verificar que el usuario actual es administrador
        current_user_id = get_jwt_identity()
        current_user = Usuario.query.get(current_user_id)
        
        if not current_user or current_user.rol != 'administrador':
            return jsonify({'error': 'Acceso denegado. Solo administradores pueden registrar usuarios'}), 403
        
        data = request.get_json()
        
        if not data or not all(k in data for k in ['username', 'email', 'password']):
            return jsonify({'error': 'Username, email y password son requeridos'}), 400
        
        # Verificar que el username y email no existan
        if Usuario.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'El username ya existe'}), 400
        
        if Usuario.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'El email ya existe'}), 400
        
        # Crear hash del password
        password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Crear nuevo usuario
        nuevo_usuario = Usuario(
            username=data['username'],
            email=data['email'],
            password_hash=password_hash,
            rol=data.get('rol', 'usuario')
        )
        
        db.session.add(nuevo_usuario)
        db.session.commit()
        
        return jsonify({
            'message': 'Usuario creado exitosamente',
            'user': nuevo_usuario.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Obtener perfil del usuario actual"""
    try:
        current_user_id = get_jwt_identity()
        print(f"DEBUG: current_user_id en /profile: {current_user_id}") # Debugging line
        usuario = Usuario.query.get(current_user_id)
        print(f"DEBUG: Usuario encontrado en /profile: {usuario}") # Debugging line        
        if not usuario:
            print("DEBUG: Usuario no encontrado en /profile") # Debugging line
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify({'user': usuario.to_dict()}), 200
        
    except Exception as e:
        print(f"DEBUG: Error en /profile: {e}") # Debugging line
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Cambiar contraseña del usuario actual"""
    try:
        current_user_id = get_jwt_identity()
        usuario = Usuario.query.get(current_user_id)
        
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        data = request.get_json()
        
        if not data or not all(k in data for k in ['current_password', 'new_password']):
            return jsonify({'error': 'Contraseña actual y nueva contraseña son requeridas'}), 400
        
        # Verificar contraseña actual
        if not bcrypt.checkpw(data['current_password'].encode('utf-8'), usuario.password_hash.encode('utf-8')):
            return jsonify({'error': 'Contraseña actual incorrecta'}), 401
        
        # Actualizar contraseña
        new_password_hash = bcrypt.hashpw(data['new_password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        usuario.password_hash = new_password_hash
        
        db.session.commit()
        
        return jsonify({'message': 'Contraseña actualizada exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Cerrar sesión (en el frontend se debe eliminar el token)"""
    return jsonify({'message': 'Sesión cerrada exitosamente'}), 200





