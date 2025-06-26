import * as nodemailer from 'nodemailer';
import { ContactData } from '../models/ContactModel';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;
  private toEmails: string[];

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'info@patitasmoviles.com';
    this.toEmails = (process.env.EMAIL_TO || '').split(',').filter(email => email.trim());
    
    const config: EmailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
      }
    };

    this.transporter = nodemailer.createTransport(config);
  }

  /**
   * Envía un email de notificación cuando se recibe un nuevo contacto
   * @param contactData Datos del contacto
   * @param geolocationData Datos de geolocalización
   */
  public async sendContactNotification(
    contactData: ContactData, 
    geolocationData: { country_name: string; city?: string }
  ): Promise<boolean> {
    try {
      console.log('📧 Preparing to send contact notification email...');
      console.log('📧 Email configuration:', {
        from: this.fromEmail,
        to: this.toEmails,
        toCount: this.toEmails.length
      });
      
      const subject = `Nuevo contacto desde ${geolocationData.country_name} - Patitas Móviles`;
      
      const htmlContent = this.generateEmailHTML(contactData, geolocationData);
      const textContent = this.generateEmailText(contactData, geolocationData);

      const mailOptions = {
        from: this.fromEmail,
        to: this.toEmails.join(', '),
        subject: subject,
        text: textContent,
        html: htmlContent
      };

      console.log('📤 Sending email with subject:', subject);
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Contact notification email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error sending contact notification email:', error);
      return false;
    }
  }

  /**
   * Genera el contenido HTML del email
   */
  private generateEmailHTML(
    contactData: ContactData, 
    geolocationData: { country_name: string; city?: string }
  ): string {
    const fecha = new Date(contactData.fecha_creacion).toLocaleString('es-ES', {
      timeZone: 'America/Caracas',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2b6cb0, #3182ce); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
          .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
          .label { font-weight: bold; color: #2b6cb0; }
          .location { background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🐾 Nuevo Contacto - Patitas Móviles</h2>
            <p>Se ha recibido un nuevo mensaje de contacto</p>
          </div>
          <div class="content">
            <div class="info-row">
              <span class="label">Nombre:</span> ${contactData.nombre}
            </div>
            <div class="info-row">
              <span class="label">Email:</span> ${contactData.email}
            </div>
            ${contactData.telefono ? `<div class="info-row"><span class="label">Teléfono:</span> ${contactData.telefono}</div>` : ''}
            <div class="info-row">
              <span class="label">Mensaje:</span><br>
              ${contactData.mensaje.replace(/\n/g, '<br>')}
            </div>
            
            <div class="location">
              <h4>📍 Información de Ubicación</h4>
              <div><span class="label">País:</span> ${geolocationData.country_name}</div>
              ${geolocationData.city ? `<div><span class="label">Ciudad:</span> ${geolocationData.city}</div>` : ''}
              <div><span class="label">Dirección IP:</span> ${contactData.ip_address}</div>
            </div>
            
            <div class="info-row">
              <span class="label">Fecha y Hora:</span> ${fecha}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera el contenido de texto plano del email
   */
  private generateEmailText(
    contactData: ContactData, 
    geolocationData: { country_name: string; city?: string }
  ): string {
    const fecha = new Date(contactData.fecha_creacion).toLocaleString('es-ES', {
      timeZone: 'America/Caracas'
    });

    return `
NUEVO CONTACTO - PATITAS MÓVILES
================================

Nombre: ${contactData.nombre}
Email: ${contactData.email}
${contactData.telefono ? `Teléfono: ${contactData.telefono}\n` : ''}Mensaje:
${contactData.mensaje}

INFORMACIÓN DE UBICACIÓN:
País: ${geolocationData.country_name}
${geolocationData.city ? `Ciudad: ${geolocationData.city}\n` : ''}Dirección IP: ${contactData.ip_address}

Fecha y Hora: ${fecha}
    `;
  }

  async sendPaymentNotification(paymentData: any, locationData: any): Promise<boolean> {
    try {
      console.log('💳 Preparing to send payment notification email...');
      console.log('💳 Payment data:', {
        id: paymentData.id,
        service: paymentData.service,
        amount: paymentData.amount,
        email: paymentData.email
      });
      
      const subject = `💳 Nuevo Pago Recibido - ${paymentData.service}`;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">💳 Nuevo Pago Recibido</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Patitas Móviles - Sistema de Pagos</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Detalles del Pago</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p><strong>ID de Pago:</strong> #${paymentData.id}</p>
              <p><strong>Servicio:</strong> ${paymentData.service}</p>
              <p><strong>Monto:</strong> $${paymentData.amount} ${paymentData.currency}</p>
              <p><strong>Cliente:</strong> ${paymentData.cardHolderName}</p>
              <p><strong>Email:</strong> ${paymentData.email}</p>
              <p><strong>Tarjeta:</strong> ${paymentData.cardNumber}</p>
            </div>
            
            <h3 style="color: #333; margin-bottom: 15px;">Información de Ubicación</h3>
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <p><strong>IP:</strong> ${paymentData.ipAddress}</p>
              <p><strong>País:</strong> ${locationData?.country_name || 'No disponible'}</p>
              <p><strong>Ciudad:</strong> ${locationData?.city || 'No disponible'}</p>
              <p><strong>Región:</strong> ${locationData?.region_name || 'No disponible'}</p>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">Este es un mensaje automático del sistema de pagos de Patitas Móviles</p>
          </div>
        </div>
      `;
    
      const textContent = `
        NUEVO PAGO RECIBIDO - PATITAS MÓVILES
        
        Detalles del Pago:
        - ID: #${paymentData.id}
        - Servicio: ${paymentData.service}
        - Monto: $${paymentData.amount} ${paymentData.currency}
        - Cliente: ${paymentData.cardHolderName}
        - Email: ${paymentData.email}
        - Tarjeta: ${paymentData.cardNumber}
        
        Información de Ubicación:
        - IP: ${paymentData.ipAddress}
        - País: ${locationData?.country_name || 'No disponible'}
        - Ciudad: ${locationData?.city || 'No disponible'}
        - Región: ${locationData?.region_name || 'No disponible'}
        
        Este es un mensaje automático del sistema de pagos.
      `;
      
      const mailOptions = {
        from: this.fromEmail,
        to: this.toEmails.join(', '),
        subject,
        text: textContent,
        html: htmlContent
      };
      
      console.log('📤 Sending payment notification email with subject:', subject);
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Payment notification email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error sending payment notification email:', error);
      return false;
    }
  }

  /**
   * Verifica la configuración del servicio de email
   */
  public async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service is ready');
      return true;
    } catch (error) {
      console.error('Email service verification failed:', error);
      return false;
    }
  }
}

export default EmailService;
