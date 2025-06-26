import express, { Request, Response, NextFunction } from 'express';
import contactRoutes from './contact';
import paymentRoutes from './payment';
import ContactController from '../controllers/ContactController';
import AdminController from '../controllers/AdminController';
import { requireAuth } from '../middleware/auth';

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

// Contacts view page (protected)
router.get('/contacts', requireAuth, async (req, res) => {
  const contactController = new ContactController();
  await contactController.renderContactsView(req, res);
});

// Admin page (protected)
router.get('/admin', requireAuth, async (req, res) => {
  const adminController = new AdminController();
  await adminController.renderAdminView(req, res);
});

// Payments view page (protected)
router.get('/payments', requireAuth, (req, res) => {
  res.render('payments', {
    title: 'Pagos',
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || '',
    user: req.user
  });
});

// Rutas de contacto
router.use('/contact', contactRoutes);

// Usar las rutas de pago
router.use('/payment', paymentRoutes);

export default router;
