# Manual de Usuario - Sistema de Inventario Blockchain

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Panel Principal](#panel-principal)
4. [Gestión de Productos](#gestión-de-productos)
5. [Control de Inventario](#control-de-inventario)
6. [Registro de Transacciones](#registro-de-transacciones)
7. [Consultas y Reportes](#consultas-y-reportes)
8. [Información Blockchain](#información-blockchain)
9. [Configuración](#configuración)
10. [Preguntas Frecuentes](#preguntas-frecuentes)

## Introducción

El Sistema de Inventario Blockchain es una herramienta moderna para gestionar el inventario de su empresa con la seguridad y transparencia que proporciona la tecnología blockchain.

### ¿Qué puede hacer con este sistema?

- ✅ **Gestionar productos**: Crear, editar y organizar su catálogo de productos
- ✅ **Controlar inventario**: Monitorear stock en tiempo real por ubicación
- ✅ **Registrar movimientos**: Documentar entradas, salidas y transferencias
- ✅ **Generar reportes**: Obtener información detallada sobre su inventario
- ✅ **Auditoría blockchain**: Tener un registro inmutable de todas las operaciones
- ✅ **Alertas automáticas**: Recibir notificaciones de stock bajo

### Beneficios de la tecnología blockchain

- **Inmutabilidad**: Los registros no pueden ser alterados una vez confirmados
- **Transparencia**: Todas las operaciones son verificables
- **Trazabilidad**: Historial completo de cada producto y transacción
- **Seguridad**: Protección criptográfica de los datos

## Acceso al Sistema

### Iniciar Sesión

1. Abra su navegador web y vaya a la dirección del sistema
2. Ingrese su **nombre de usuario** y **contraseña**
3. Haga clic en **"Iniciar Sesión"**

![Login Screen](screenshots/login.png)

### Credenciales por Defecto

**Para Administradores**:
- Usuario: `admin`
- Contraseña: `admin123`

**Para Operadores**:
- Usuario: `usuario`
- Contraseña: `user123`

> ⚠️ **Importante**: Cambie estas contraseñas por defecto en su primera sesión.

### Cerrar Sesión

Para cerrar sesión de forma segura:
1. Haga clic en su nombre de usuario en la esquina superior derecha
2. Seleccione **"Cerrar Sesión"**

## Panel Principal

El panel principal (Dashboard) le proporciona una vista general del estado de su inventario.

### Información Mostrada

#### Tarjetas de Resumen
- **Total de Productos**: Cantidad total de productos en el catálogo
- **Productos Activos**: Productos disponibles para venta/uso
- **Ubicaciones**: Número de almacenes o ubicaciones configuradas
- **Transacciones del Mes**: Movimientos registrados en el mes actual

#### Alertas Importantes
- **Stock Bajo**: Productos que han alcanzado el stock mínimo
- **Sin Stock**: Productos agotados que requieren reposición
- **Transacciones Pendientes**: Operaciones que requieren confirmación

#### Gráficos y Estadísticas
- **Movimientos por Día**: Gráfico de transacciones diarias
- **Productos por Categoría**: Distribución del inventario
- **Valor del Inventario**: Valor total del stock actual

### Navegación Rápida

Desde el panel principal puede acceder rápidamente a:
- **Productos con Stock Bajo**: Clic en la alerta correspondiente
- **Registrar Nueva Transacción**: Botón "Nueva Transacción"
- **Ver Inventario Completo**: Botón "Ver Inventario"

## Gestión de Productos

### Ver Lista de Productos

1. En el menú lateral, haga clic en **"Productos"**
2. Verá una tabla con todos los productos registrados

#### Información Mostrada
- **Código**: Identificador único del producto
- **Nombre**: Descripción del producto
- **Categoría**: Clasificación del producto
- **Proveedor**: Empresa proveedora
- **Precio**: Precio unitario
- **Stock Mínimo**: Cantidad mínima requerida
- **Estado**: Activo/Inactivo

### Buscar Productos

1. Use la **barra de búsqueda** en la parte superior
2. Puede buscar por:
   - Código de producto
   - Nombre del producto
   - Descripción

### Filtrar Productos

Use los filtros disponibles para encontrar productos específicos:
- **Por Categoría**: Seleccione una categoría del menú desplegable
- **Por Proveedor**: Filtre por empresa proveedora
- **Por Estado**: Mostrar solo productos activos o inactivos

### Crear Nuevo Producto

1. Haga clic en el botón **"Nuevo Producto"**
2. Complete el formulario con la información requerida:

#### Campos Obligatorios
- **Código**: Identificador único (ej: LAPTOP001)
- **Nombre**: Nombre descriptivo del producto

#### Campos Opcionales
- **Descripción**: Información detallada del producto
- **Categoría**: Seleccione de la lista disponible
- **Proveedor**: Seleccione de la lista disponible
- **Precio Unitario**: Costo por unidad
- **Unidad de Medida**: pcs, kg, litros, etc.
- **Stock Mínimo**: Cantidad mínima antes de alerta

3. Haga clic en **"Guardar"** para crear el producto

> 📝 **Nota**: Al crear un producto, automáticamente se registra en la blockchain para garantizar su inmutabilidad.

### Editar Producto

1. En la lista de productos, haga clic en el icono de **edición** (lápiz)
2. Modifique los campos necesarios
3. Haga clic en **"Actualizar"** para guardar los cambios

### Desactivar Producto

1. En la lista de productos, haga clic en el icono de **eliminar** (papelera)
2. Confirme la acción en el diálogo que aparece
3. El producto se marcará como inactivo (no se elimina permanentemente)

## Control de Inventario

### Ver Inventario Actual

1. En el menú lateral, haga clic en **"Inventario"**
2. Verá el stock actual de todos los productos por ubicación

#### Información Mostrada
- **Producto**: Código y nombre del producto
- **Ubicación**: Almacén o ubicación específica
- **Cantidad Actual**: Stock disponible
- **Stock Mínimo**: Cantidad mínima configurada
- **Estado**: OK, BAJO, AGOTADO

### Filtrar Inventario

#### Por Ubicación
1. Seleccione una ubicación del menú desplegable
2. El inventario se filtrará automáticamente

#### Por Estado de Stock
- **Stock Normal**: Productos con cantidad suficiente
- **Stock Bajo**: Productos cerca del mínimo
- **Sin Stock**: Productos agotados

### Alertas de Stock

El sistema genera alertas automáticas cuando:
- Un producto alcanza el stock mínimo
- Un producto se agota completamente
- Hay discrepancias en el inventario

#### Tipos de Alertas
- 🟢 **Verde**: Stock normal
- 🟡 **Amarillo**: Stock bajo (requiere atención)
- 🔴 **Rojo**: Sin stock (requiere reposición urgente)

### Consultar Historial de Movimientos

1. Seleccione un producto específico
2. Haga clic en **"Ver Historial"**
3. Verá todos los movimientos de ese producto:
   - Entradas (compras, devoluciones)
   - Salidas (ventas, transferencias)
   - Ajustes de inventario

## Registro de Transacciones

### Tipos de Transacciones

#### Transacciones de Entrada
- **Compra**: Adquisición de productos a proveedores
- **Devolución**: Productos devueltos por clientes
- **Ajuste Positivo**: Corrección de inventario hacia arriba
- **Transferencia Entrada**: Recepción desde otra ubicación

#### Transacciones de Salida
- **Venta**: Productos vendidos a clientes
- **Transferencia Salida**: Envío a otra ubicación
- **Ajuste Negativo**: Corrección de inventario hacia abajo
- **Merma**: Productos dañados o perdidos

### Registrar Nueva Transacción

1. Haga clic en **"Transacciones"** en el menú lateral
2. Haga clic en **"Nueva Transacción"**
3. Complete el formulario:

#### Información Requerida
- **Producto**: Seleccione de la lista disponible
- **Ubicación**: Almacén donde ocurre la transacción
- **Tipo de Transacción**: Seleccione el tipo apropiado
- **Cantidad**: Número de unidades (positivo para entradas, el sistema ajusta automáticamente)
- **Precio Unitario**: Costo por unidad (opcional)

#### Información Adicional
- **Referencia**: Número de factura, orden, etc.
- **Observaciones**: Comentarios adicionales

4. Haga clic en **"Registrar Transacción"**

> 🔗 **Blockchain**: Cada transacción se registra automáticamente en la blockchain para crear un historial inmutable.

### Ver Historial de Transacciones

1. En la sección **"Transacciones"**, verá una lista de todos los movimientos
2. Use los filtros para encontrar transacciones específicas:
   - **Por Fecha**: Rango de fechas específico
   - **Por Producto**: Movimientos de un producto particular
   - **Por Ubicación**: Transacciones en una ubicación específica
   - **Por Tipo**: Filtrar por tipo de transacción

#### Información Mostrada
- **Fecha y Hora**: Cuándo se realizó la transacción
- **Producto**: Código y nombre del producto
- **Tipo**: Tipo de transacción realizada
- **Cantidad**: Unidades movidas
- **Ubicación**: Dónde ocurrió el movimiento
- **Usuario**: Quién registró la transacción
- **Estado Blockchain**: Confirmación en blockchain

### Verificar Transacciones en Blockchain

1. En el historial de transacciones, busque la columna **"Estado Blockchain"**
2. Los estados posibles son:
   - ✅ **Confirmado**: Registrado exitosamente en blockchain
   - ⏳ **Pendiente**: En proceso de confirmación
   - 🔄 **Simulado**: Registrado localmente (blockchain no disponible)

3. Haga clic en el hash de transacción para ver detalles en blockchain

## Consultas y Reportes

### Reportes Disponibles

#### Reporte de Inventario Actual
- Stock por producto y ubicación
- Valor total del inventario
- Productos con stock bajo
- Productos sin movimiento

#### Reporte de Movimientos
- Transacciones por período
- Movimientos por producto
- Movimientos por ubicación
- Análisis de entradas y salidas

#### Reporte de Valorización
- Valor del inventario por categoría
- Costo promedio de productos
- Análisis de rotación de inventario

### Generar Reportes

1. Vaya a la sección correspondiente (Inventario, Transacciones, etc.)
2. Configure los filtros deseados:
   - Rango de fechas
   - Productos específicos
   - Ubicaciones
   - Categorías

3. Haga clic en **"Generar Reporte"**
4. El reporte se mostrará en pantalla
5. Use **"Exportar"** para descargar en formato Excel o PDF

### Consultas Personalizadas

#### Buscar por Código de Producto
1. Use la barra de búsqueda global
2. Ingrese el código del producto
3. Acceda directamente a la información del producto

#### Consultar Stock en Tiempo Real
1. Vaya a **"Inventario"**
2. La información se actualiza automáticamente
3. Use **"Actualizar"** para refrescar manualmente

## Información Blockchain

### Panel de Blockchain

1. Haga clic en **"Blockchain"** en el menú lateral
2. Verá información sobre el estado de la red blockchain

#### Información de Red
- **Estado de Conexión**: Conectado/Desconectado
- **Número de Bloque Actual**: Último bloque procesado
- **ID de Red**: Identificador de la red blockchain
- **Precio del Gas**: Costo actual de transacciones

#### Estadísticas del Contrato
- **Productos Registrados**: Total en blockchain
- **Transacciones Registradas**: Total en blockchain
- **Dirección del Contrato**: Ubicación del smart contract

### Verificar Registros en Blockchain

#### Para Productos
1. Vaya a la lista de productos
2. Busque la columna **"Hash Blockchain"**
3. Haga clic en el hash para ver detalles

#### Para Transacciones
1. Vaya al historial de transacciones
2. Busque la columna **"Estado Blockchain"**
3. Haga clic en el hash de transacción

### Entender los Estados de Blockchain

- **✅ Confirmado**: La operación está registrada permanentemente en blockchain
- **⏳ Pendiente**: La transacción está siendo procesada
- **🔄 Simulado**: Registrado localmente, blockchain no disponible
- **❌ Error**: Falló el registro en blockchain

## Configuración

### Configuración de Usuario

#### Cambiar Contraseña
1. Haga clic en su nombre de usuario
2. Seleccione **"Configuración"**
3. En la sección **"Seguridad"**:
   - Ingrese su contraseña actual
   - Ingrese la nueva contraseña
   - Confirme la nueva contraseña
4. Haga clic en **"Actualizar Contraseña"**

#### Información del Perfil
- **Nombre de Usuario**: No se puede cambiar
- **Email**: Actualizable por administradores
- **Rol**: Asignado por administradores

### Configuración del Sistema (Solo Administradores)

#### Gestión de Usuarios
1. Vaya a **"Usuarios"** en el menú lateral
2. Puede:
   - Crear nuevos usuarios
   - Editar información de usuarios existentes
   - Desactivar usuarios
   - Cambiar roles y permisos

#### Gestión de Categorías
1. Vaya a **"Configuración"** > **"Categorías"**
2. Puede:
   - Crear nuevas categorías
   - Editar categorías existentes
   - Desactivar categorías no utilizadas

#### Gestión de Proveedores
1. Vaya a **"Configuración"** > **"Proveedores"**
2. Puede:
   - Registrar nuevos proveedores
   - Actualizar información de contacto
   - Gestionar estado activo/inactivo

#### Gestión de Ubicaciones
1. Vaya a **"Configuración"** > **"Ubicaciones"**
2. Puede:
   - Crear nuevas ubicaciones/almacenes
   - Editar información de ubicaciones
   - Desactivar ubicaciones no utilizadas

### Configuración de Alertas

#### Stock Mínimo
- Configure el stock mínimo para cada producto
- El sistema generará alertas automáticamente
- Las alertas aparecen en el dashboard

#### Notificaciones
- Configure qué tipos de eventos generan notificaciones
- Establezca umbrales para alertas de stock
- Configure frecuencia de reportes automáticos

## Preguntas Frecuentes

### Preguntas Generales

**P: ¿Qué es blockchain y por qué es importante?**
R: Blockchain es una tecnología que crea un registro inmutable y transparente de todas las transacciones. Esto significa que una vez que se registra una operación, no puede ser alterada, proporcionando máxima confiabilidad y trazabilidad.

**P: ¿Puedo usar el sistema sin conexión a internet?**
R: El sistema requiere conexión a internet para funcionar completamente. Sin embargo, si la blockchain no está disponible, el sistema continuará funcionando en modo local y sincronizará automáticamente cuando se restablezca la conexión.

**P: ¿Qué pasa si cometo un error al registrar una transacción?**
R: Puede registrar una transacción de ajuste para corregir el error. Todas las transacciones quedan registradas en el historial para mantener la trazabilidad completa.

### Problemas Técnicos

**P: No puedo iniciar sesión, ¿qué hago?**
R: 
1. Verifique que está usando las credenciales correctas
2. Asegúrese de que las mayúsculas/minúsculas sean correctas
3. Contacte al administrador si el problema persiste

**P: El sistema está lento, ¿es normal?**
R: 
1. Verifique su conexión a internet
2. Cierre otras aplicaciones que puedan estar usando recursos
3. Contacte al soporte técnico si el problema continúa

**P: No veo algunos productos en la lista, ¿por qué?**
R: 
1. Verifique los filtros aplicados
2. Algunos productos pueden estar marcados como inactivos
3. Use la función de búsqueda para encontrar productos específicos

### Blockchain y Seguridad

**P: ¿Qué significa "Estado Blockchain: Simulado"?**
R: Significa que la transacción se registró localmente pero no pudo confirmarse en blockchain (posiblemente por problemas de conectividad). La transacción es válida y se sincronizará automáticamente cuando se restablezca la conexión.

**P: ¿Puedo eliminar una transacción registrada?**
R: No se pueden eliminar transacciones una vez registradas, esto es por diseño para mantener la integridad del historial. Si necesita corregir algo, debe registrar una transacción de ajuste.

**P: ¿Mis datos están seguros?**
R: Sí, el sistema utiliza múltiples capas de seguridad:
- Autenticación JWT
- Cifrado de contraseñas con bcrypt
- Registro inmutable en blockchain
- Validación de datos en múltiples niveles

### Soporte y Contacto

**P: ¿Dónde puedo obtener ayuda adicional?**
R: 
- Consulte este manual de usuario
- Contacte al administrador del sistema
- Envíe un email a: soporte@inventario-blockchain.com
- Revise la documentación técnica para problemas avanzados

**P: ¿Cómo reporto un error o sugiero una mejora?**
R: 
- Use el formulario de contacto en el sistema
- Envíe un email detallado con pasos para reproducir el problema
- Incluya capturas de pantalla si es posible

---

**Versión del Manual**: 1.0  
**Fecha de Actualización**: Enero 2025  
**Para más información**: soporte@inventario-blockchain.com

