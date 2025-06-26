import path from 'path';

// Configuración de la aplicación
export interface AppConfig {
  // Configuración del servidor
  port: number;
  env: string;
  
  // Rutas de la aplicación
  paths: {
    views: string;
    public: string;
    uploads?: string;
  };
  
  // Configuración de logging
  logging: {
    level: string;
    format: string;
  };
  
  // Configuración de la base de datos (para futuro uso)
  database?: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  
  // Información de la veterinaria
  veterinaria: {
    nombre: string;
    descripcion: string;
    telefono: string;
    email: string;
    direccion: string;
    horarios: {
      lunes_viernes: string;
      sabado: string;
      domingo: string;
    };
    redes_sociales: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      whatsapp?: string;
    };
  };
  
  // Configuración de seguridad
  security: {
    rateLimitRequests: number;
    rateLimitWindowMs: number;
    sessionSecret?: string;
  };
}

// Función para obtener la configuración del entorno
function getEnvConfig(): AppConfig {
  const env = process.env.NODE_ENV || 'development';
  const port = parseInt(process.env.PORT || '3000', 10);
  
  // Rutas base del proyecto
  const projectRoot = path.resolve(__dirname, '../..');
  
  return {
    port,
    env,
    
    paths: {
      views: path.join(projectRoot, 'views'),
      public: path.join(projectRoot, 'public'),
      uploads: path.join(projectRoot, 'uploads')
    },
    
    logging: {
      level: env === 'production' ? 'warn' : 'debug',
      format: env === 'production' ? 'combined' : 'dev'
    },
    
    // Configuración de la veterinaria
    veterinaria: {
      nombre: 'Patitas Móviles',
      descripcion: 'Servicio veterinario móvil que lleva atención médica de calidad directamente a tu hogar. Cuidamos a tus mascotas con amor y profesionalismo.',
      telefono: '+58 424-123-4567',
      email: 'info@patitasmoviles.com',
      direccion: 'Caracas, Venezuela',
      horarios: {
        lunes_viernes: '8:00 AM - 6:00 PM',
        sabado: '9:00 AM - 4:00 PM',
        domingo: 'Solo emergencias'
      },
      redes_sociales: {
        facebook: 'https://facebook.com/patitasmoviles',
        instagram: 'https://instagram.com/patitasmoviles',
        whatsapp: 'https://wa.me/584241234567'
      }
    },
    
    security: {
      rateLimitRequests: 100,
      rateLimitWindowMs: 15 * 60 * 1000, // 15 minutos
      sessionSecret: process.env.SESSION_SECRET || 'patitas-moviles-secret-key'
    }
  };
}

// Configuración principal exportada
export const config: AppConfig = getEnvConfig();

// Función para validar la configuración
export function validateConfig(): boolean {
  const requiredFields = [
    'port',
    'env',
    'paths.views',
    'paths.public',
    'veterinaria.nombre',
    'veterinaria.telefono',
    'veterinaria.email'
  ];
  
  for (const field of requiredFields) {
    const value = getNestedValue(config, field);
    if (value === undefined || value === null || value === '') {
      console.error(`Configuración faltante: ${field}`);
      return false;
    }
  }
  
  // Validar que el puerto sea válido
  if (config.port < 1 || config.port > 65535) {
    console.error('Puerto inválido:', config.port);
    return false;
  }
  
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(config.veterinaria.email)) {
    console.error('Email inválido:', config.veterinaria.email);
    return false;
  }
  
  return true;
}

// Función auxiliar para obtener valores anidados
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Función para mostrar información de configuración
export function logConfigInfo(): void {
  console.log('='.repeat(50));
  console.log('🐾 PATITAS MÓVILES - CONFIGURACIÓN');
  console.log('='.repeat(50));
  console.log(`Entorno: ${config.env}`);
  console.log(`Puerto: ${config.port}`);
  console.log(`Veterinaria: ${config.veterinaria.nombre}`);
  console.log(`Email: ${config.veterinaria.email}`);
  console.log(`Teléfono: ${config.veterinaria.telefono}`);
  console.log(`Vistas: ${config.paths.views}`);
  console.log(`Archivos públicos: ${config.paths.public}`);
  console.log('='.repeat(50));
}

// Configuraciones específicas por entorno
export const isDevelopment = config.env === 'development';
export const isProduction = config.env === 'production';
export const isTesting = config.env === 'test';

// Configuración de CORS
export const corsOptions = {
  origin: isDevelopment 
    ? ['http://localhost:3000', 'http://127.0.0.1:3000']
    : [], // En producción, especificar dominios permitidos
  credentials: true,
  optionsSuccessStatus: 200
};

// Configuración de sesiones
export const sessionConfig = {
  secret: config.security.sessionSecret!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction, // Solo HTTPS en producción
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
};

// Configuración de multer para uploads (si se necesita en el futuro)
export const uploadConfig = {
  dest: config.paths.uploads,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Permitir solo imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
};

// Función para obtener URL base
export function getBaseUrl(): string {
  if (isProduction) {
    return process.env.BASE_URL || `https://patitasmoviles.com`;
  }
  return `http://localhost:${config.port}`;
}

// Función para obtener configuración de email (para futuro uso)
export function getEmailConfig() {
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || config.veterinaria.email,
      pass: process.env.SMTP_PASS || ''
    }
  };
}

// Exportar configuración por defecto
export default config;
