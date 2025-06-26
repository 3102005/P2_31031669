import { ValidationError } from 'express-validator';

// Extender los tipos de Express para agregar propiedades personalizadas
declare global {
  namespace Express {
    interface Request {
      // Errores de validación
      validationErrors?: ValidationError[];
      
      // Usuario autenticado
      user?: {
        id: number;
        username: string;
        email?: string;
        google_id?: string;
        created_at: string;
      };
      
      // Flash messages
      flash?: (type: string, message?: string) => string[] | void;
      
      // Datos de sesión personalizados
      sessionData?: {
        lastVisit?: Date;
        preferences?: {
          theme?: 'light' | 'dark';
          language?: 'es' | 'en';
        };
      };
    }
    
    interface Session {
      returnTo?: string;
    }
    
    interface Response {
      // Métodos de respuesta personalizados
      success?: (data?: any, message?: string) => Response;
      error?: (message: string, statusCode?: number) => Response;
    }
    
    interface Locals {
      // Datos globales disponibles en todas las vistas
      currentYear: number;
      currentPath: string;
      isHomePage: boolean;
      
      // Información de contacto
      contactInfo: {
        phone: string;
        email: string;
        address: string;
      };
      
      // Estadísticas (opcional)
      stats?: {
        totalCitas: number;
        citasPendientes: number;
        citasCompletadas: number;
        mascotasRegistradas: number;
      };
      
      // Datos del usuario autenticado (opcional)
      user?: {
        id: number;
        email: string;
        role: string;
        nombre?: string;
      };
      
      // Datos específicos de la página (opcional)
      pageData?: {
        title?: string;
        description?: string;
        keywords?: string[];
        breadcrumbs?: Array<{
          name: string;
          url?: string;
        }>;
      };
      
      // Mensajes flash (opcional)
      messages?: {
        success?: string[];
        error?: string[];
        warning?: string[];
        info?: string[];
      };
      
      // Configuración de la aplicación
      appConfig?: {
        veterinaria: {
          nombre: string;
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
      };
    }
  }
}

// Tipos para los datos del formulario de cita
export interface CitaFormData {
  // Datos de la mascota
  nombreMascota: string;
  especieMascota: string;
  razaMascota?: string;
  edadMascota: number;
  propietario: string;
  telefono: string;
  email?: string;
  
  // Datos de la cita
  servicioId: number;
  fecha: string;
  hora: string;
  direccion: string;
  observaciones?: string;
}

// Tipos para respuestas de API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos para filtros de búsqueda
export interface SearchFilters {
  query?: string;
  categoria?: string;
  estado?: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  fechaDesde?: string;
  fechaHasta?: string;
  propietario?: string;
  mascota?: string;
  page?: number;
  limit?: number;
}

// Tipos para configuración de paginación
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Tipos para notificaciones
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  userId?: number;
}

// Tipos para logs del sistema
export interface SystemLog {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  userId?: number;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
}

// Tipos para configuración de email
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Tipos para plantillas de email
export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

// Tipos para datos de email
export interface EmailData {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
  }>;
}

// Exportar tipos para uso en otros archivos
export * from '../models/VeterinariaModel';
