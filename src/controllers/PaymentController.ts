import { Request, Response } from 'express';
import PaymentModel from '../models/PaymentModel';
import GeolocationService from '../services/GeolocationService';
import EmailService from '../services/EmailService';
import FakePaymentService from '../services/FakePaymentService';

interface PaymentValidationError {
  field: string;
  message: string;
}

class PaymentController {
  private paymentModel: PaymentModel;
  private geolocationService: GeolocationService;
  private emailService: EmailService;
  private fakePaymentService: FakePaymentService;

  constructor() {
    this.paymentModel = new PaymentModel();
    this.geolocationService = new GeolocationService();
    this.emailService = new EmailService();
    this.fakePaymentService = new FakePaymentService();
  }

  private validatePaymentData(data: any): PaymentValidationError[] {
    const errors: PaymentValidationError[] = [];

    // Validar email
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({ field: 'email', message: 'Email válido es requerido' });
    }

    // Validar nombre del titular
    if (!data.cardHolderName || data.cardHolderName.trim().length < 2) {
      errors.push({ field: 'cardHolderName', message: 'Nombre del titular es requerido (mínimo 2 caracteres)' });
    }

    // Validar número de tarjeta (básico)
    if (!data.cardNumber || !/^\d{13,19}$/.test(data.cardNumber.replace(/\s/g, ''))) {
      errors.push({ field: 'cardNumber', message: 'Número de tarjeta válido es requerido (13-19 dígitos)' });
    }

    // Validar mes de expiración
    const month = parseInt(data.expirationMonth);
    if (!data.expirationMonth || month < 1 || month > 12) {
      errors.push({ field: 'expirationMonth', message: 'Mes de expiración válido es requerido (1-12)' });
    }

    // Validar año de expiración
    const currentYear = new Date().getFullYear();
    const year = parseInt(data.expirationYear);
    if (!data.expirationYear || year < currentYear || year > currentYear + 20) {
      errors.push({ field: 'expirationYear', message: 'Año de expiración válido es requerido' });
    }

    // Validar CVV
    if (!data.cvv || !/^\d{3,4}$/.test(data.cvv)) {
      errors.push({ field: 'cvv', message: 'CVV válido es requerido (3-4 dígitos)' });
    }

    // Validar monto
    const amount = parseFloat(data.amount);
    if (!data.amount || amount <= 0 || amount > 10000) {
      errors.push({ field: 'amount', message: 'Monto válido es requerido (mayor a 0, máximo $10,000)' });
    }

    // Validar moneda
    if (!data.currency || !['USD', 'VES', 'EUR'].includes(data.currency)) {
      errors.push({ field: 'currency', message: 'Moneda válida es requerida (USD, VES, EUR)' });
    }

    // Validar servicio
    const validServices = ['Consulta General', 'Vacunación', 'Grooming', 'Tratamientos'];
    if (!data.service || !validServices.includes(data.service)) {
      errors.push({ field: 'service', message: 'Servicio válido es requerido' });
    }

    return errors;
  }

  private maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    return '**** **** **** ' + cleaned.slice(-4);
  }

  async add(req: Request, res: Response): Promise<void> {
    try {
      console.log('💳 Processing payment request:', {
        email: req.body.email,
        amount: req.body.amount,
        currency: req.body.currency,
        service: req.body.service
      });
      
      const validationErrors = this.validatePaymentData(req.body);
      
      if (validationErrors.length > 0) {
        console.log('❌ Payment validation failed:', validationErrors);
        res.status(400).json({
          success: false,
          message: 'Datos de pago inválidos',
          errors: validationErrors
        });
        return;
      }

      // Obtener IP del cliente
      const clientIp = this.geolocationService.extractClientIP(req);
      console.log('🌍 Client IP extracted:', clientIp);
      
      // Obtener geolocalización
      const locationData = await this.geolocationService.getLocationByIP(clientIp);
      console.log('📍 Location data retrieved:', locationData);

      // Procesar pago a través de FakePayment API
      console.log('💳 Processing payment through FakePayment API...');
      const paymentResult = await this.fakePaymentService.processPayment({
        email: req.body.email.trim(),
        cardHolderName: req.body.cardHolderName.trim(),
        cardNumber: req.body.cardNumber,
        expirationMonth: req.body.expirationMonth,
        expirationYear: req.body.expirationYear,
        cvv: req.body.cvv,
        amount: parseFloat(req.body.amount),
        currency: req.body.currency,
        service: req.body.service
      });

      console.log('🔍 FakePayment API result:', {
        success: paymentResult.success,
        status: paymentResult.status,
        transactionId: paymentResult.transactionId
      });

      // Preparar datos para guardar (enmascarar número de tarjeta por seguridad)
      const paymentData = {
        email: req.body.email.trim(),
        cardHolderName: req.body.cardHolderName.trim(),
        cardNumber: this.maskCardNumber(req.body.cardNumber), // Enmascarar por seguridad
        expirationMonth: req.body.expirationMonth,
        expirationYear: req.body.expirationYear,
        cvv: '***', // No guardar CVV por seguridad PCI DSS
        amount: parseFloat(req.body.amount),
        currency: req.body.currency,
        service: req.body.service,
        ipAddress: clientIp,
        status: paymentResult.status,
        transactionId: paymentResult.transactionId
      };

      // Guardar en base de datos
      console.log('💾 Saving payment to database...');
      const paymentId = await this.paymentModel.create(paymentData);
      console.log('✅ Payment saved successfully with ID:', paymentId);

      // Enviar notificación por email
      console.log('📧 Attempting to send payment notification email...');
      const emailSent = await this.emailService.sendPaymentNotification({
        ...paymentData,
        id: paymentId
      }, locationData);
      
      if (emailSent) {
        console.log('✅ Payment notification email sent successfully');
      } else {
        console.log('❌ Failed to send payment notification email');
        // No fallar el pago por error de email
      }

      // Responder según el resultado del pago
      if (paymentResult.success && paymentResult.status === 'APPROVED') {
        res.status(201).json({
          success: true,
          message: paymentResult.message || 'Pago procesado exitosamente',
          data: {
            paymentId,
            transactionId: paymentResult.transactionId,
            amount: paymentData.amount,
            currency: paymentData.currency,
            service: paymentData.service,
            status: paymentResult.status
          }
        });
      } else {
        // Pago rechazado o con error
        res.status(400).json({
          success: false,
          message: paymentResult.message || 'Pago rechazado',
          data: {
            paymentId,
            transactionId: paymentResult.transactionId,
            status: paymentResult.status,
            reason: paymentResult.message
          }
        });
      }

    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al procesar el pago'
      });
    }
  }

  async index(req: Request, res: Response): Promise<void> {
    try {
      const payments = await this.paymentModel.getAll();
      res.json({
        success: true,
        data: payments
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los pagos'
      });
    }
  }

  async show(req: Request, res: Response): Promise<void> {
    try {
      const paymentId = parseInt(req.params.id);
      
      if (isNaN(paymentId)) {
        res.status(400).json({
          success: false,
          message: 'ID de pago inválido'
        });
        return;
      }

      const payment = await this.paymentModel.getById(paymentId);
      
      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Pago no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('Error fetching payment:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el pago'
      });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const payments = await this.paymentModel.getAll();
      console.log('📊 Payments retrieved for list view:', payments.length);
      res.json({
        success: true,
        payments: payments
      });
    } catch (error) {
      console.error('❌ Error fetching payments for list:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los pagos',
        payments: []
      });
    }
  }

  getServices(req: Request, res: Response): void {
    const services = [
      { name: 'Consulta General', price: 25, currency: 'USD' },
      { name: 'Vacunación', price: 15, currency: 'USD' },
      { name: 'Grooming', price: 20, currency: 'USD' },
      { name: 'Tratamientos', price: 30, currency: 'USD' }
    ];

    res.json({
      success: true,
      data: services
    });
  }
}

export default PaymentController;
