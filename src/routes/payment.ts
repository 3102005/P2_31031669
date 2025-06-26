import { Router } from 'express';
import PaymentController from '../controllers/PaymentController';

const router = Router();
const paymentController = new PaymentController();

// Ruta para obtener servicios disponibles
router.get('/services', (req, res) => paymentController.getServices(req, res));

// Ruta para procesar pagos
router.post('/add', (req, res) => paymentController.add(req, res));

// Ruta para listar pagos (API)
router.get('/list', (req, res) => paymentController.list(req, res));

// Rutas administrativas (opcional)
router.get('/', (req, res) => paymentController.index(req, res));
router.get('/:id', (req, res) => paymentController.show(req, res));

export default router;
