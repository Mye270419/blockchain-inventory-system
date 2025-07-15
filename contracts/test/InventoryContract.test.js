const InventoryContract = artifacts.require("InventoryContract");

contract("InventoryContract", (accounts) => {
  let inventoryContract;
  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  beforeEach(async () => {
    inventoryContract = await InventoryContract.new({ from: owner });
  });

  describe("Deployment", () => {
    it("should deploy successfully", async () => {
      const address = await inventoryContract.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it("should set the correct owner", async () => {
      const contractOwner = await inventoryContract.owner();
      assert.equal(contractOwner, owner);
    });

    it("should authorize the owner by default", async () => {
      const isAuthorized = await inventoryContract.authorizedUsers(owner);
      assert.equal(isAuthorized, true);
    });
  });

  describe("User Authorization", () => {
    it("should allow owner to authorize users", async () => {
      await inventoryContract.authorizeUser(user1, { from: owner });
      const isAuthorized = await inventoryContract.authorizedUsers(user1);
      assert.equal(isAuthorized, true);
    });

    it("should emit UserAuthorized event", async () => {
      const result = await inventoryContract.authorizeUser(user1, { from: owner });
      const event = result.logs[0];
      assert.equal(event.event, "UserAuthorized");
      assert.equal(event.args.user, user1);
      assert.equal(event.args.authorizer, owner);
    });

    it("should allow owner to revoke users", async () => {
      await inventoryContract.authorizeUser(user1, { from: owner });
      await inventoryContract.revokeUser(user1, { from: owner });
      const isAuthorized = await inventoryContract.authorizedUsers(user1);
      assert.equal(isAuthorized, false);
    });

    it("should not allow non-owner to authorize users", async () => {
      try {
        await inventoryContract.authorizeUser(user2, { from: user1 });
        assert.fail("Expected error not received");
      } catch (error) {
        assert(error.message.includes("Solo el propietario puede ejecutar esta funcion"));
      }
    });
  });

  describe("Product Registration", () => {
    beforeEach(async () => {
      await inventoryContract.authorizeUser(user1, { from: owner });
    });

    it("should register a new product", async () => {
      const code = "PROD001";
      const name = "Producto de Prueba";
      const dataHash = web3.utils.keccak256("test data");

      const result = await inventoryContract.registerProduct(
        code,
        name,
        dataHash,
        { from: user1 }
      );

      const event = result.logs[0];
      assert.equal(event.event, "ProductRegistered");
      assert.equal(event.args.code, code);
      assert.equal(event.args.name, name);
      assert.equal(event.args.dataHash, dataHash);
      assert.equal(event.args.creator, user1);

      const productId = event.args.productId.toNumber();
      assert.equal(productId, 1);
    });

    it("should not allow duplicate product codes", async () => {
      const code = "PROD001";
      const name = "Producto de Prueba";
      const dataHash = web3.utils.keccak256("test data");

      await inventoryContract.registerProduct(code, name, dataHash, { from: user1 });

      try {
        await inventoryContract.registerProduct(code, name, dataHash, { from: user1 });
        assert.fail("Expected error not received");
      } catch (error) {
        assert(error.message.includes("Codigo de producto ya existe"));
      }
    });

    it("should not allow unauthorized users to register products", async () => {
      const code = "PROD001";
      const name = "Producto de Prueba";
      const dataHash = web3.utils.keccak256("test data");

      try {
        await inventoryContract.registerProduct(code, name, dataHash, { from: user2 });
        assert.fail("Expected error not received");
      } catch (error) {
        assert(error.message.includes("Usuario no autorizado"));
      }
    });

    it("should retrieve product by code", async () => {
      const code = "PROD001";
      const name = "Producto de Prueba";
      const dataHash = web3.utils.keccak256("test data");

      await inventoryContract.registerProduct(code, name, dataHash, { from: user1 });

      const product = await inventoryContract.getProductByCode(code);
      assert.equal(product.id.toNumber(), 1);
      assert.equal(product.code, code);
      assert.equal(product.name, name);
      assert.equal(product.dataHash, dataHash);
      assert.equal(product.creator, user1);
      assert.equal(product.active, true);
    });
  });

  describe("Inventory Transactions", () => {
    let productId;

    beforeEach(async () => {
      await inventoryContract.authorizeUser(user1, { from: owner });
      
      const code = "PROD001";
      const name = "Producto de Prueba";
      const dataHash = web3.utils.keccak256("test data");
      
      const result = await inventoryContract.registerProduct(code, name, dataHash, { from: user1 });
      productId = result.logs[0].args.productId.toNumber();
    });

    it("should record inventory transaction", async () => {
      const locationId = 1;
      const quantity = 100;
      const unitPrice = web3.utils.toWei("10", "ether");
      const transactionType = "Compra";
      const referenceNumber = "FAC-001";
      const dataHash = web3.utils.keccak256("transaction data");

      const result = await inventoryContract.recordInventoryTransaction(
        productId,
        locationId,
        quantity,
        unitPrice,
        transactionType,
        referenceNumber,
        dataHash,
        { from: user1 }
      );

      const event = result.logs[0];
      assert.equal(event.event, "InventoryTransactionRecorded");
      assert.equal(event.args.productId.toNumber(), productId);
      assert.equal(event.args.locationId.toNumber(), locationId);
      assert.equal(event.args.quantity.toNumber(), quantity);
      assert.equal(event.args.transactionType, transactionType);
      assert.equal(event.args.executor, user1);
    });

    it("should not allow zero quantity transactions", async () => {
      const locationId = 1;
      const quantity = 0;
      const unitPrice = web3.utils.toWei("10", "ether");
      const transactionType = "Compra";
      const referenceNumber = "FAC-001";
      const dataHash = web3.utils.keccak256("transaction data");

      try {
        await inventoryContract.recordInventoryTransaction(
          productId,
          locationId,
          quantity,
          unitPrice,
          transactionType,
          referenceNumber,
          dataHash,
          { from: user1 }
        );
        assert.fail("Expected error not received");
      } catch (error) {
        assert(error.message.includes("Cantidad no puede ser cero"));
      }
    });

    it("should get product transactions", async () => {
      const locationId = 1;
      const quantity1 = 100;
      const quantity2 = -50;
      const unitPrice = web3.utils.toWei("10", "ether");
      const transactionType1 = "Compra";
      const transactionType2 = "Venta";
      const referenceNumber = "FAC-001";
      const dataHash = web3.utils.keccak256("transaction data");

      await inventoryContract.recordInventoryTransaction(
        productId,
        locationId,
        quantity1,
        unitPrice,
        transactionType1,
        referenceNumber,
        dataHash,
        { from: user1 }
      );

      await inventoryContract.recordInventoryTransaction(
        productId,
        locationId,
        quantity2,
        unitPrice,
        transactionType2,
        referenceNumber,
        dataHash,
        { from: user1 }
      );

      const transactions = await inventoryContract.getProductTransactions(productId);
      assert.equal(transactions.length, 2);
      assert.equal(transactions[0].toNumber(), 1);
      assert.equal(transactions[1].toNumber(), 2);
    });
  });

  describe("Data Integrity", () => {
    let productId;

    beforeEach(async () => {
      await inventoryContract.authorizeUser(user1, { from: owner });
      
      const code = "PROD001";
      const name = "Producto de Prueba";
      const dataHash = web3.utils.keccak256("test data");
      
      const result = await inventoryContract.registerProduct(code, name, dataHash, { from: user1 });
      productId = result.logs[0].args.productId.toNumber();
    });

    it("should verify product data integrity", async () => {
      const dataHash = web3.utils.keccak256("test data");
      const isValid = await inventoryContract.verifyDataIntegrity(productId, dataHash, true);
      assert.equal(isValid, true);
    });

    it("should detect corrupted product data", async () => {
      const wrongHash = web3.utils.keccak256("wrong data");
      const isValid = await inventoryContract.verifyDataIntegrity(productId, wrongHash, true);
      assert.equal(isValid, false);
    });
  });

  describe("Contract Statistics", () => {
    beforeEach(async () => {
      await inventoryContract.authorizeUser(user1, { from: owner });
    });

    it("should track total products", async () => {
      let total = await inventoryContract.getTotalProducts();
      assert.equal(total.toNumber(), 0);

      const code = "PROD001";
      const name = "Producto de Prueba";
      const dataHash = web3.utils.keccak256("test data");
      
      await inventoryContract.registerProduct(code, name, dataHash, { from: user1 });
      
      total = await inventoryContract.getTotalProducts();
      assert.equal(total.toNumber(), 1);
    });

    it("should track total transactions", async () => {
      let total = await inventoryContract.getTotalTransactions();
      assert.equal(total.toNumber(), 0);

      // Registrar producto primero
      const code = "PROD001";
      const name = "Producto de Prueba";
      const dataHash = web3.utils.keccak256("test data");
      
      const result = await inventoryContract.registerProduct(code, name, dataHash, { from: user1 });
      const productId = result.logs[0].args.productId.toNumber();

      // Registrar transacción
      await inventoryContract.recordInventoryTransaction(
        productId,
        1,
        100,
        web3.utils.toWei("10", "ether"),
        "Compra",
        "FAC-001",
        web3.utils.keccak256("transaction data"),
        { from: user1 }
      );
      
      total = await inventoryContract.getTotalTransactions();
      assert.equal(total.toNumber(), 1);
    });
  });
});

