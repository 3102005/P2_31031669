import { Router } from 'express';
import ContactController from '../controllers/ContactController';

const router = Router();
const contactController = new ContactController();

// Ruta para obtener la configuración (reCAPTCHA site key, Google Analytics)
router.get('/config', contactController.getConfig.bind(contactController));

// Ruta para renderizar la vista de contactos
router.get('/view', contactController.renderContactsView.bind(contactController));

// Ruta para enviar el formulario de contacto
router.post('/submit', 
  contactController.getValidationRules(),
  contactController.submitContact.bind(contactController)
);

// Rutas para administración (opcional)
router.get('/all', contactController.getAllContacts.bind(contactController));
router.get('/:id', contactController.getContactById.bind(contactController));

export default router;
