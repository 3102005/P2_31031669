import axios from 'axios';

export interface GeolocationData {
  ip: string;
  country_name: string;
  country_code: string;
  region_name?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

class GeolocationService {
  private apiKey: string;
  private baseUrl: string = 'http://api.ipstack.com';

  constructor() {
    this.apiKey = process.env.IPSTACK_KEY || '';
    if (!this.apiKey) {
      console.warn('IPSTACK_KEY not found in environment variables');
    }
  }

  /**
   * Obtiene la información de geolocalización basada en la IP
   * @param ip Dirección IP del usuario
   * @returns Datos de geolocalización
   */
  public async getLocationByIP(ip: string): Promise<GeolocationData | null> {
    try {
      // Si es localhost o IP local, usar una IP pública de ejemplo
      const targetIP = this.isLocalIP(ip) ? '8.8.8.8' : ip;
      
      const response = await axios.get(`${this.baseUrl}/${targetIP}`, {
        params: {
          access_key: this.apiKey,
          format: 'json'
        },
        timeout: 5000
      });

      if (response.data && response.data.country_name) {
        return {
          ip: ip,
          country_name: response.data.country_name,
          country_code: response.data.country_code,
          region_name: response.data.region_name,
          city: response.data.city,
          latitude: response.data.latitude,
          longitude: response.data.longitude
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching geolocation data:', error);
      // Retornar datos por defecto en caso de error
      return {
        ip: ip,
        country_name: 'Venezuela',
        country_code: 'VE',
        region_name: 'Distrito Capital',
        city: 'Caracas'
      };
    }
  }

  /**
   * Verifica si la IP es local o localhost
   * @param ip Dirección IP
   * @returns true si es IP local
   */
  private isLocalIP(ip: string): boolean {
    const localPatterns = [
      /^127\./,
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^::1$/,
      /^localhost$/i
    ];

    return localPatterns.some(pattern => pattern.test(ip)) || ip === '::1';
  }

  /**
   * Extrae la IP real del usuario considerando proxies y load balancers
   * @param req Objeto request de Express
   * @returns Dirección IP del usuario
   */
  public extractClientIP(req: any): string {
    const forwarded = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    const remoteAddress = req.connection?.remoteAddress || req.socket?.remoteAddress;
    
    if (forwarded) {
      // x-forwarded-for puede contener múltiples IPs separadas por comas
      const ips = forwarded.split(',').map((ip: string) => ip.trim());
      return ips[0];
    }
    
    if (realIP) {
      return realIP;
    }
    
    return remoteAddress || '127.0.0.1';
  }
}

export default GeolocationService;
