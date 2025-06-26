import axios from 'axios';

interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  score?: number;
  action?: string;
}

class RecaptchaService {
  private secretKey: string;
  private verifyUrl: string = 'https://www.google.com/recaptcha/api/siteverify';

  constructor() {
    this.secretKey = process.env.RECAPTCHA_SECRET_KEY || '';
    if (!this.secretKey) {
      console.warn('RECAPTCHA_SECRET_KEY not found in environment variables');
    }
  }

  /**
   * Verifica el token de reCAPTCHA con Google
   * @param token Token de reCAPTCHA del cliente
   * @param remoteip IP del cliente (opcional)
   * @returns Promise con el resultado de la verificación
   */
  public async verifyToken(token: string, remoteip?: string): Promise<{
    success: boolean;
    score?: number;
    errors?: string[];
  }> {
    try {
      if (!token) {
        return {
          success: false,
          errors: ['Token de reCAPTCHA requerido']
        };
      }

      const params = new URLSearchParams();
      params.append('secret', this.secretKey);
      params.append('response', token);
      if (remoteip) {
        params.append('remoteip', remoteip);
      }

      const response = await axios.post<RecaptchaResponse>(
        this.verifyUrl,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 5000
        }
      );

      const data = response.data;

      if (data.success) {
        // Para reCAPTCHA v3, verificar el score (opcional)
        if (data.score !== undefined) {
          // Score entre 0.0 (bot) y 1.0 (humano)
          // Umbral recomendado: 0.5
          const threshold = 0.5;
          if (data.score < threshold) {
            return {
              success: false,
              score: data.score,
              errors: [`Score de reCAPTCHA muy bajo: ${data.score}`]
            };
          }
        }

        return {
          success: true,
          score: data.score
        };
      } else {
        const errors = this.translateErrorCodes(data['error-codes'] || []);
        return {
          success: false,
          errors: errors
        };
      }
    } catch (error) {
      console.error('Error verifying reCAPTCHA:', error);
      return {
        success: false,
        errors: ['Error interno al verificar reCAPTCHA']
      };
    }
  }

  /**
   * Traduce los códigos de error de reCAPTCHA a mensajes legibles
   * @param errorCodes Array de códigos de error
   * @returns Array de mensajes de error traducidos
   */
  private translateErrorCodes(errorCodes: string[]): string[] {
    const errorMessages: { [key: string]: string } = {
      'missing-input-secret': 'Falta la clave secreta de reCAPTCHA',
      'invalid-input-secret': 'Clave secreta de reCAPTCHA inválida',
      'missing-input-response': 'Falta el token de respuesta de reCAPTCHA',
      'invalid-input-response': 'Token de respuesta de reCAPTCHA inválido o malformado',
      'bad-request': 'Solicitud malformada',
      'timeout-or-duplicate': 'Token expirado o duplicado'
    };

    return errorCodes.map(code => 
      errorMessages[code] || `Error desconocido: ${code}`
    );
  }

  /**
   * Verifica si el servicio de reCAPTCHA está configurado correctamente
   * @returns true si está configurado
   */
  public isConfigured(): boolean {
    return !!this.secretKey;
  }

  /**
   * Obtiene la clave del sitio para el frontend
   * @returns Clave del sitio de reCAPTCHA
   */
  public getSiteKey(): string {
    return process.env.RECAPTCHA_SITE_KEY || '';
  }
}

export default RecaptchaService;
