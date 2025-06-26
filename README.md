# Mi Proyecto - Sistema de Contacto y Pagos

Un sistema web desarrollado con Node.js, Express y TypeScript que incluye funcionalidades de contacto y procesamiento de pagos con integración de múltiples servicios externos.

## Características Principales

- **Sistema de Contacto**: Formulario de contacto con validación y notificaciones por email
- **Sistema de Pagos**: Procesamiento de pagos con validación de tarjetas
- **Geolocalización**: Detección automática de ubicación por IP
- **Seguridad**: Integración con Google reCAPTCHA
- **Base de Datos**: Almacenamiento en SQLite
- **Notificaciones**: Sistema de emails automáticos

## Tecnologías Utilizadas

- **Backend**: Node.js, Express.js, TypeScript
- **Base de Datos**: SQLite3
- **Motor de Vistas**: EJS
- **Validación**: Express-validator
- **Email**: Nodemailer
- **HTTP Client**: Axios

## Estructura del Proyecto

```
src/
├── app.ts                 # Configuración principal de Express
├── bin/www.ts            # Punto de entrada del servidor
├── config/               # Configuraciones
├── controllers/          # Controladores de rutas
│   ├── ContactController.ts
│   └── PaymentController.ts
├── models/               # Modelos de datos
│   ├── ContactModel.ts
│   └── PaymentModel.ts
├── routes/               # Definición de rutas
│   ├── index.ts
│   ├── contact.ts
│   └── payment.ts
├── services/             # Servicios externos
│   ├── EmailService.ts
│   ├── FakePaymentService.ts
│   ├── GeolocationService.ts
│   └── RecaptchaService.ts
└── types/                # Definiciones de tipos TypeScript
```

## Configuración e Integración de Servicios

### 1. Servicio de Email (EmailService)

**Propósito**: Envío de notificaciones por correo electrónico cuando se reciben nuevos contactos.

**Configuración**:
- Utiliza Nodemailer para el envío de emails
- Soporta configuración SMTP personalizable
- Configuración por defecto para Gmail

**Integración**:
1. El servicio se inicializa en el `ContactController`
2. Se configura automáticamente con las credenciales del archivo `.env`
3. Se ejecuta automáticamente al recibir un nuevo contacto
4. Incluye datos de geolocalización en las notificaciones

**Funcionalidades**:
- Envío de emails HTML con formato profesional
- Soporte para múltiples destinatarios
- Inclusión de datos de contacto y geolocalización
- Manejo de errores y logging detallado

### 2. Servicio de Pagos Falsos (FakePaymentService)

**Propósito**: Procesamiento de pagos utilizando una API externa de pruebas.

**Configuración**:
- Integración con FakePayment API (https://fakepayment.onrender.com)
- Requiere clave API para autenticación
- Soporte para múltiples monedas

**Integración**:
1. Se inicializa en el `PaymentController`
2. Procesa datos de tarjetas de crédito
3. Valida información antes del envío
4. Retorna estados de transacción (APPROVED, REJECTED, ERROR, INSUFFICIENT)

**Funcionalidades**:
- Validación de datos de tarjeta
- Procesamiento asíncrono de pagos
- Manejo de diferentes estados de respuesta
- Logging detallado de transacciones
- Almacenamiento de resultados en base de datos

### 3. Servicio de Geolocalización (GeolocationService)

**Propósito**: Obtención de información geográfica basada en la dirección IP del usuario.

**Configuración**:
- Integración con IPStack API (http://api.ipstack.com)
- Requiere clave API para acceso
- Manejo especial para IPs locales

**Integración**:
1. Se utiliza en ambos controladores (Contact y Payment)
2. Se ejecuta automáticamente al procesar formularios
3. Los datos se almacenan junto con la información del usuario
4. Proporciona contexto geográfico para análisis

**Funcionalidades**:
- Detección automática de país y ciudad
- Manejo de IPs locales (usa IP pública de ejemplo)
- Obtención de coordenadas geográficas
- Timeout configurable para requests
- Fallback en caso de errores

### 4. Servicio de reCAPTCHA (RecaptchaService)

**Propósito**: Validación de seguridad para prevenir spam y bots.

**Configuración**:
- Integración con Google reCAPTCHA API
- Requiere clave secreta de Google
- Soporte para reCAPTCHA v2 y v3

**Integración**:
1. Se utiliza en el `ContactController`
2. Validación opcional en formularios
3. Verificación del lado del servidor
4. Integración con el sistema de validación de Express

**Funcionalidades**:
- Verificación de tokens de reCAPTCHA
- Soporte para puntuación (score) en v3
- Validación de hostname
- Manejo de errores específicos de Google
- Logging de intentos de verificación

## Modelos de Datos

### ContactModel

**Propósito**: Gestión de datos de contacto en SQLite.

**Estructura de Datos**:
- `id`: Identificador único
- `nombre`: Nombre del contacto
- `email`: Correo electrónico
- `telefono`: Teléfono (opcional)
- `mensaje`: Mensaje del contacto
- `ip_address`: Dirección IP
- `pais`: País detectado
- `ciudad`: Ciudad detectada
- `fecha_creacion`: Timestamp de creación

**Funcionalidades**:
- Creación automática de tabla
- Inserción de nuevos contactos
- Consulta de contactos existentes
- Validación de datos

### PaymentModel

**Propósito**: Gestión de transacciones de pago en SQLite.

**Estructura de Datos**:
- `id`: Identificador único
- `email`: Email del cliente
- `cardHolderName`: Nombre del titular
- `cardNumber`: Número de tarjeta (encriptado)
- `amount`: Monto de la transacción
- `currency`: Moneda
- `service`: Servicio contratado
- `status`: Estado de la transacción
- `transactionId`: ID de transacción externa
- `ipAddress`: IP del cliente
- `createdAt`: Timestamp de creación

**Funcionalidades**:
- Creación automática de tabla
- Inserción de transacciones
- Actualización de estados
- Consulta de historial

## Controladores

### ContactController

**Responsabilidades**:
- Validación de formularios de contacto
- Integración con servicios de geolocalización
- Envío de notificaciones por email
- Verificación de reCAPTCHA
- Almacenamiento en base de datos

**Flujo de Procesamiento**:
1. Validación de datos del formulario
2. Verificación opcional de reCAPTCHA
3. Obtención de datos de geolocalización
4. Almacenamiento en base de datos
5. Envío de notificación por email
6. Respuesta al cliente

### PaymentController

**Responsabilidades**:
- Validación de datos de pago
- Procesamiento de transacciones
- Integración con servicio de pagos
- Almacenamiento de resultados
- Manejo de errores de pago

**Flujo de Procesamiento**:
1. Validación de datos de tarjeta
2. Obtención de geolocalización
3. Procesamiento con FakePayment API
4. Almacenamiento de transacción
5. Respuesta con resultado

## Scripts Disponibles

- `npm start`: Ejecuta la aplicación en modo producción con ts-node
- `npm run dev`: Ejecuta la aplicación en modo desarrollo con nodemon
- `npm run build`: Compila TypeScript a JavaScript
- `npm run build:watch`: Compila en modo watch
- `npm run serve`: Ejecuta la versión compilada
- `npm run clean`: Limpia el directorio dist

## Instalación y Configuración

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd mi-proyecto
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   - Crear archivo `.env` en la raíz del proyecto
   - Configurar las claves API necesarias para cada servicio

4. **Compilar TypeScript**
   ```bash
   npm run build
   ```

5. **Ejecutar la aplicación**
   ```bash
   npm start
   ```

## Arquitectura de Servicios

La aplicación sigue una arquitectura modular donde cada servicio tiene una responsabilidad específica:

- **Separación de responsabilidades**: Cada servicio maneja una funcionalidad específica
- **Inyección de dependencias**: Los servicios se inyectan en los controladores
- **Manejo de errores**: Cada servicio implementa su propio manejo de errores
- **Logging**: Sistema de logging consistente en todos los servicios
- **Configuración centralizada**: Variables de entorno para configuración

## Consideraciones de Seguridad

- **Validación de entrada**: Todos los datos se validan antes del procesamiento
- **reCAPTCHA**: Protección contra spam y bots
- **Sanitización**: Los datos se sanitizan antes del almacenamiento
- **Manejo de errores**: Los errores no exponen información sensible
- **Timeouts**: Configuración de timeouts para requests externos

## Mantenimiento y Monitoreo

- **Logging detallado**: Cada servicio registra sus operaciones
- **Manejo de errores**: Errores capturados y registrados apropiadamente
- **Validación de configuración**: Advertencias cuando faltan configuraciones
- **Base de datos**: Almacenamiento persistente para auditoría

Este sistema proporciona una base sólida para aplicaciones web que requieren funcionalidades de contacto y procesamiento de pagos, con integración robusta de servicios externos y manejo apropiado de errores.
