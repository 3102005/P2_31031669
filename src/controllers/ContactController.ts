import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import ContactModel, { ContactData } from '../models/ContactModel';
import GeolocationService from '../services/GeolocationService';
import EmailService from '../services/EmailService';
import RecaptchaService from '../services/RecaptchaService';

class ContactController {
  private contactModel: ContactModel;
  private geolocationService: GeolocationService;
  private emailService: EmailService;
  private recaptchaService: RecaptchaService;

  constructor() {
    this.contactModel = new ContactModel();
    this.geolocationService = new GeolocationService();
    this.emailService = new EmailService();
    this.recaptchaService = new RecaptchaService();
  }

  /**
   * Validaciones para el formulario de contacto
   */
  public getValidationRules() {
    return [
      body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('El nombre es requerido'),
      
      body('email')
        .isEmail()
        .withMessage('Debe proporcionar un email válido')
        .normalizeEmail(),
      
      body('telefono')
        .optional({ checkFalsy: true })
        .isLength({ min: 1, max: 50 })
        .withMessage('Número de teléfono inválido'),
      
      body('mensaje')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('El mensaje es requerido'),
      
      body('recaptcha')
        .optional({ checkFalsy: true })
    ];
  }

  /**
   * Procesa el formulario de contacto
   */
  public async submitContact(req: Request, res: Response): Promise<void> {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: errors.array()
        });
        return;
      }

      const { nombre, email, telefono, mensaje, recaptcha } = req.body;

      // Obtener IP del cliente
      const clientIP = this.geolocationService.extractClientIP(req);

      // Verificar reCAPTCHA
      const recaptchaResult = await this.recaptchaService.verifyToken(recaptcha, clientIP);
      if (!recaptchaResult.success) {
        res.status(400).json({
          success: false,
          message: 'Verificación reCAPTCHA fallida',
          errors: recaptchaResult.errors
        });
        return;
      }

      // Obtener geolocalización
      const geolocationData = await this.geolocationService.getLocationByIP(clientIP);
      const pais = geolocationData?.country_name || 'Desconocido';
      const ciudad = geolocationData?.city || undefined;

      // Crear registro en la base de datos
      const contactData: Omit<ContactData, 'id' | 'fecha_creacion'> = {
        nombre,
        email,
        telefono: telefono || undefined,
        mensaje,
        ip_address: clientIP,
        pais,
        ciudad
      };

      const contactId = await this.contactModel.createContact(contactData);

      // Obtener el contacto creado para enviar el email
      const savedContact = await this.contactModel.getContactById(contactId);
      
      if (savedContact) {
        // Enviar notificación por email
        const emailSent = await this.emailService.sendContactNotification(
          savedContact,
          { country_name: pais, city: ciudad }
        );

        if (!emailSent) {
          console.warn('Failed to send email notification for contact:', contactId);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.',
        data: {
          id: contactId,
          pais: pais,
          ciudad: ciudad
        }
      });

    } catch (error) {
      console.error('Error processing contact form:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor. Por favor, intenta nuevamente.'
      });
    }
  }

  /**
   * Obtiene todos los contactos (para administración)
   */
  public async getAllContacts(req: Request, res: Response): Promise<void> {
    try {
      const contacts = await this.contactModel.getAllContacts();
      res.status(200).json({
        success: true,
        data: contacts
      });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los contactos'
      });
    }
  }

  /**
   * Obtiene un contacto por ID
   */
  public async getContactById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const contact = await this.contactModel.getContactById(parseInt(id));
      
      if (!contact) {
        res.status(404).json({
          success: false,
          message: 'Contacto no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: contact
      });
    } catch (error) {
      console.error('Error fetching contact:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el contacto'
      });
    }
  }

  /**
   * Renderiza la vista de contactos para administración
   */
  public async renderContactsView(req: Request, res: Response): Promise<void> {
    try {
      const contacts = await this.contactModel.getAllContacts();
      res.render('contacts', { 
        title: 'Contactos Registrados',
        contacts: contacts,
        googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || ''
      });
    } catch (error) {
      console.error('Error rendering contacts view:', error);
      res.status(500).render('error', {
        message: 'Error al cargar los contactos',
        error: error
      });
    }
  }

  /**
   * Obtiene la configuración para el frontend (reCAPTCHA site key)
   */
  public getConfig(req: Request, res: Response): void {
    res.status(200).json({
      success: true,
      data: {
        recaptchaSiteKey: this.recaptchaService.getSiteKey(),
        googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || ''
      }
    });
  }
}

export default ContactController;
