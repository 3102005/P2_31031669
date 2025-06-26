import express, { Request, Response, NextFunction } from 'express';
import contactRoutes from './contact';
import paymentRoutes from './payment';
import ContactController from '../controllers/ContactController';

const router = express.Router();

/* GET home page. */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.render('index', {
    title: 'Patitas Móviles - Veterinaria a Domicilio',
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || '',
    recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY || '',
    Nombres: 'Cristhian Alfonzo Angyalbert',
    Apellidos: 'Padron Alvarez',
    CI: '31.031.669',
    Seccion: '4'
  });
});

// Contacts view page
router.get('/contacts', async (req, res) => {
  const contactController = new ContactController();
  await contactController.renderContactsView(req, res);
});

// Admin page
router.get('/admin', (req, res) => {
  res.render('admin', {
    title: 'Panel de Administración',
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || ''
  });
});

// Payments view page
router.get('/payments', (req, res) => {
  res.render('payments', {
    title: 'Pagos',
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || ''
  });
});

// Rutas de contacto
router.use('/contact', contactRoutes);

// Usar las rutas de pago
router.use('/payment', paymentRoutes);

export default router;
