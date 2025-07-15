import json
import os
from web3 import Web3
import hashlib
from datetime import datetime

class BlockchainService:
    def __init__(self):
        # Configuración de Web3
        self.w3 = None
        self.contract = None
        self.account = None
        self.private_key = None
        
        # Configuración desde variables de entorno
        self.blockchain_url = os.getenv('BLOCKCHAIN_NETWORK', 'http://localhost:8545')
        self.contract_address = os.getenv('CONTRACT_ADDRESS', '')
        
        # Inicializar conexión
        self.initialize_connection()
    
    def initialize_connection(self):
        """Inicializar conexión con la blockchain"""
        try:
            # Conectar a la blockchain
            self.w3 = Web3(Web3.HTTPProvider(self.blockchain_url))
            
            # Agregar middleware para redes POA (como Ganache) - comentado por compatibilidad
            # self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
            
            # Verificar conexión
            if not self.w3.is_connected():
                print("Warning: No se pudo conectar a la blockchain")
                return False
            
            # Configurar cuenta por defecto (primera cuenta de Ganache)
            accounts = self.w3.eth.accounts
            if accounts:
                self.account = accounts[0]
                print(f"Usando cuenta: {self.account}")
            
            # Cargar contrato si existe la dirección
            if self.contract_address:
                self.load_contract()
            
            return True
            
        except Exception as e:
            print(f"Error inicializando blockchain: {e}")
            return False
    
    def load_contract(self):
        """Cargar el smart contract"""
        try:
            # Cargar ABI del contrato compilado
            contract_path = '/home/ubuntu/blockchain-inventory-system/contracts/build/contracts/InventoryContract.json'
            
            if os.path.exists(contract_path):
                with open(contract_path, 'r') as f:
                    contract_json = json.load(f)
                    contract_abi = contract_json['abi']
                
                # Crear instancia del contrato
                self.contract = self.w3.eth.contract(
                    address=self.contract_address,
                    abi=contract_abi
                )
                print(f"Contrato cargado: {self.contract_address}")
                return True
            else:
                print("Warning: Archivo de contrato no encontrado")
                return False
                
        except Exception as e:
            print(f"Error cargando contrato: {e}")
            return False
    
    def is_connected(self):
        """Verificar si está conectado a la blockchain"""
        return self.w3 and self.w3.is_connected()
    
    def get_latest_block(self):
        """Obtener el último bloque"""
        if not self.is_connected():
            return None
        
        try:
            return self.w3.eth.get_block('latest')
        except Exception as e:
            print(f"Error obteniendo último bloque: {e}")
            return None
    
    def register_product_on_blockchain(self, product_data):
        """Registrar producto en la blockchain"""
        if not self.contract or not self.account:
            # Simular registro si no hay conexión real
            return self.simulate_blockchain_transaction('product_register', product_data)
        
        try:
            # Generar hash de los datos
            data_hash = self.generate_data_hash(product_data)
            
            # Preparar transacción
            transaction = self.contract.functions.registerProduct(
                product_data['codigo'],
                product_data['nombre'],
                data_hash
            ).build_transaction({
                'from': self.account,
                'gas': 2000000,
                'gasPrice': self.w3.to_wei('20', 'gwei'),
                'nonce': self.w3.eth.get_transaction_count(self.account)
            })
            
            # Firmar y enviar transacción
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Esperar confirmación
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                'success': True,
                'tx_hash': receipt.transactionHash.hex(),
                'block_number': receipt.blockNumber,
                'data_hash': data_hash
            }
            
        except Exception as e:
            print(f"Error registrando producto en blockchain: {e}")
            # Simular en caso de error
            return self.simulate_blockchain_transaction('product_register', product_data)
    
    def record_inventory_transaction_on_blockchain(self, transaction_data):
        """Registrar transacción de inventario en la blockchain"""
        if not self.contract or not self.account:
            # Simular registro si no hay conexión real
            return self.simulate_blockchain_transaction('inventory_transaction', transaction_data)
        
        try:
            # Generar hash de los datos
            data_hash = self.generate_data_hash(transaction_data)
            
            # Preparar transacción
            transaction = self.contract.functions.recordInventoryTransaction(
                transaction_data['producto_id'],
                transaction_data['ubicacion_id'],
                transaction_data['cantidad'] if transaction_data.get('es_entrada') else -transaction_data['cantidad'],
                int(transaction_data.get('precio_unitario', 0) * 100),  # Convertir a centavos
                transaction_data['tipo_transaccion'],
                transaction_data.get('referencia', ''),
                data_hash
            ).build_transaction({
                'from': self.account,
                'gas': 2000000,
                'gasPrice': self.w3.to_wei('20', 'gwei'),
                'nonce': self.w3.eth.get_transaction_count(self.account)
            })
            
            # Firmar y enviar transacción
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Esperar confirmación
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                'success': True,
                'tx_hash': receipt.transactionHash.hex(),
                'block_number': receipt.blockNumber,
                'data_hash': data_hash
            }
            
        except Exception as e:
            print(f"Error registrando transacción en blockchain: {e}")
            # Simular en caso de error
            return self.simulate_blockchain_transaction('inventory_transaction', transaction_data)
    
    def verify_data_integrity(self, data_hash, record_type, record_id):
        """Verificar integridad de datos en la blockchain"""
        if not self.contract:
            # Simular verificación
            return {'verified': True, 'simulated': True}
        
        try:
            if record_type == 'product':
                # Verificar producto
                result = self.contract.functions.verifyDataIntegrity(
                    record_id, data_hash, True
                ).call()
            else:
                # Verificar transacción
                result = self.contract.functions.verifyDataIntegrity(
                    record_id, data_hash, False
                ).call()
            
            return {'verified': result, 'simulated': False}
            
        except Exception as e:
            print(f"Error verificando integridad: {e}")
            return {'verified': False, 'error': str(e)}
    
    def get_contract_stats(self):
        """Obtener estadísticas del contrato"""
        if not self.contract:
            return {
                'total_products': 0,
                'total_transactions': 0,
                'simulated': True
            }
        
        try:
            total_products = self.contract.functions.getTotalProducts().call()
            total_transactions = self.contract.functions.getTotalTransactions().call()
            
            return {
                'total_products': total_products,
                'total_transactions': total_transactions,
                'simulated': False
            }
            
        except Exception as e:
            print(f"Error obteniendo estadísticas: {e}")
            return {
                'total_products': 0,
                'total_transactions': 0,
                'error': str(e)
            }
    
    def simulate_blockchain_transaction(self, operation_type, data):
        """Simular transacción blockchain cuando no hay conexión real"""
        # Generar hash simulado
        data_hash = self.generate_data_hash(data)
        tx_hash = f"0x{hashlib.sha256(f'{operation_type}_{datetime.now().isoformat()}'.encode()).hexdigest()}"
        
        return {
            'success': True,
            'tx_hash': tx_hash,
            'block_number': 1,  # Bloque simulado
            'data_hash': data_hash,
            'simulated': True
        }
    
    def generate_data_hash(self, data):
        """Generar hash de los datos"""
        # Convertir datos a string JSON ordenado
        data_string = json.dumps(data, sort_keys=True, default=str)
        # Generar hash SHA256
        return hashlib.sha256(data_string.encode()).hexdigest()
    
    def get_network_info(self):
        """Obtener información de la red"""
        if not self.is_connected():
            return {
                'connected': False,
                'network': 'disconnected'
            }
        
        try:
            latest_block = self.get_latest_block()
            return {
                'connected': True,
                'network': 'local',
                'latest_block': latest_block['number'] if latest_block else 0,
                'accounts': len(self.w3.eth.accounts),
                'contract_loaded': self.contract is not None
            }
        except Exception as e:
            return {
                'connected': False,
                'error': str(e)
            }

# Instancia global del servicio
blockchain_service = BlockchainService()

