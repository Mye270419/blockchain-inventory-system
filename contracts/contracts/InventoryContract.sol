// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title InventoryContract
 * @dev Smart contract para gestión de inventario con trazabilidad blockchain
 */
contract InventoryContract {
    
    // Estructura para productos
    struct Product {
        uint256 id;
        string code;
        string name;
        bytes32 dataHash; // Hash de los datos del producto
        address creator;
        uint256 timestamp;
        bool active;
    }
    
    // Estructura para transacciones de inventario
    struct InventoryTransaction {
        uint256 id;
        uint256 productId;
        uint256 locationId;
        int256 quantity; // Positivo para entradas, negativo para salidas
        uint256 unitPrice;
        string transactionType;
        string referenceNumber;
        bytes32 dataHash; // Hash de los datos de la transacción
        address executor;
        uint256 timestamp;
    }
    
    // Variables de estado
    address public owner;
    uint256 public productCounter;
    uint256 public transactionCounter;
    
    // Mappings
    mapping(uint256 => Product) public products;
    mapping(uint256 => InventoryTransaction) public transactions;
    mapping(string => uint256) public productCodeToId; // Mapeo código -> ID
    mapping(address => bool) public authorizedUsers;
    
    // Arrays para iteración
    uint256[] public productIds;
    uint256[] public transactionIds;
    
    // Eventos
    event ProductRegistered(
        uint256 indexed productId,
        string code,
        string name,
        bytes32 dataHash,
        address indexed creator
    );
    
    event InventoryTransactionRecorded(
        uint256 indexed transactionId,
        uint256 indexed productId,
        uint256 locationId,
        int256 quantity,
        string transactionType,
        address indexed executor
    );
    
    event UserAuthorized(address indexed user, address indexed authorizer);
    event UserRevoked(address indexed user, address indexed revoker);
    
    // Modificadores
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el propietario puede ejecutar esta funcion");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner || authorizedUsers[msg.sender],
            "Usuario no autorizado"
        );
        _;
    }
    
    modifier productExists(uint256 _productId) {
        require(products[_productId].id != 0, "Producto no existe");
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
        productCounter = 0;
        transactionCounter = 0;
        authorizedUsers[msg.sender] = true;
    }
    
    /**
     * @dev Registra un nuevo producto en la blockchain
     * @param _code Código único del producto
     * @param _name Nombre del producto
     * @param _dataHash Hash de los datos completos del producto
     */
    function registerProduct(
        string memory _code,
        string memory _name,
        bytes32 _dataHash
    ) public onlyAuthorized returns (uint256) {
        require(bytes(_code).length > 0, "Codigo de producto requerido");
        require(bytes(_name).length > 0, "Nombre de producto requerido");
        require(productCodeToId[_code] == 0, "Codigo de producto ya existe");
        
        productCounter++;
        uint256 newProductId = productCounter;
        
        products[newProductId] = Product({
            id: newProductId,
            code: _code,
            name: _name,
            dataHash: _dataHash,
            creator: msg.sender,
            timestamp: block.timestamp,
            active: true
        });
        
        productCodeToId[_code] = newProductId;
        productIds.push(newProductId);
        
        emit ProductRegistered(newProductId, _code, _name, _dataHash, msg.sender);
        
        return newProductId;
    }
    
    /**
     * @dev Registra una transacción de inventario
     * @param _productId ID del producto
     * @param _locationId ID de la ubicación
     * @param _quantity Cantidad (positiva para entradas, negativa para salidas)
     * @param _unitPrice Precio unitario
     * @param _transactionType Tipo de transacción
     * @param _referenceNumber Referencia externa (factura, orden, etc.)
     * @param _dataHash Hash de los datos completos de la transacción
     */
    function recordInventoryTransaction(
        uint256 _productId,
        uint256 _locationId,
        int256 _quantity,
        uint256 _unitPrice,
        string memory _transactionType,
        string memory _referenceNumber,
        bytes32 _dataHash
    ) public onlyAuthorized productExists(_productId) returns (uint256) {
        require(_quantity != 0, "Cantidad no puede ser cero");
        require(bytes(_transactionType).length > 0, "Tipo de transaccion requerido");
        
        transactionCounter++;
        uint256 newTransactionId = transactionCounter;
        
        transactions[newTransactionId] = InventoryTransaction({
            id: newTransactionId,
            productId: _productId,
            locationId: _locationId,
            quantity: _quantity,
            unitPrice: _unitPrice,
            transactionType: _transactionType,
            referenceNumber: _referenceNumber,
            dataHash: _dataHash,
            executor: msg.sender,
            timestamp: block.timestamp
        });
        
        transactionIds.push(newTransactionId);
        
        emit InventoryTransactionRecorded(
            newTransactionId,
            _productId,
            _locationId,
            _quantity,
            _transactionType,
            msg.sender
        );
        
        return newTransactionId;
    }
    
    /**
     * @dev Autoriza a un usuario para usar el contrato
     * @param _user Dirección del usuario a autorizar
     */
    function authorizeUser(address _user) public onlyOwner {
        require(_user != address(0), "Direccion invalida");
        authorizedUsers[_user] = true;
        emit UserAuthorized(_user, msg.sender);
    }
    
    /**
     * @dev Revoca autorización de un usuario
     * @param _user Dirección del usuario a revocar
     */
    function revokeUser(address _user) public onlyOwner {
        require(_user != owner, "No se puede revocar al propietario");
        authorizedUsers[_user] = false;
        emit UserRevoked(_user, msg.sender);
    }
    
    /**
     * @dev Obtiene información de un producto por código
     * @param _code Código del producto
     */
    function getProductByCode(string memory _code) public view returns (
        uint256 id,
        string memory code,
        string memory name,
        bytes32 dataHash,
        address creator,
        uint256 timestamp,
        bool active
    ) {
        uint256 productId = productCodeToId[_code];
        require(productId != 0, "Producto no encontrado");
        
        Product memory product = products[productId];
        return (
            product.id,
            product.code,
            product.name,
            product.dataHash,
            product.creator,
            product.timestamp,
            product.active
        );
    }
    
    /**
     * @dev Obtiene el número total de productos registrados
     */
    function getTotalProducts() public view returns (uint256) {
        return productCounter;
    }
    
    /**
     * @dev Obtiene el número total de transacciones registradas
     */
    function getTotalTransactions() public view returns (uint256) {
        return transactionCounter;
    }
    
    /**
     * @dev Obtiene todas las transacciones de un producto
     * @param _productId ID del producto
     */
    function getProductTransactions(uint256 _productId) public view returns (uint256[] memory) {
        uint256[] memory productTransactions = new uint256[](transactionCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= transactionCounter; i++) {
            if (transactions[i].productId == _productId) {
                productTransactions[count] = i;
                count++;
            }
        }
        
        // Redimensionar array al tamaño correcto
        uint256[] memory result = new uint256[](count);
        for (uint256 j = 0; j < count; j++) {
            result[j] = productTransactions[j];
        }
        
        return result;
    }
    
    /**
     * @dev Verifica la integridad de los datos usando el hash
     * @param _id ID del registro (producto o transacción)
     * @param _dataHash Hash a verificar
     * @param _isProduct True para producto, false para transacción
     */
    function verifyDataIntegrity(
        uint256 _id,
        bytes32 _dataHash,
        bool _isProduct
    ) public view returns (bool) {
        if (_isProduct) {
            require(products[_id].id != 0, "Producto no existe");
            return products[_id].dataHash == _dataHash;
        } else {
            require(transactions[_id].id != 0, "Transaccion no existe");
            return transactions[_id].dataHash == _dataHash;
        }
    }
}

