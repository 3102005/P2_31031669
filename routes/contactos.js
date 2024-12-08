var express = require('express');
var router = express.Router();
var ContactosController = require('../controllers/contactosController');

// Definir la ruta para manejar la solicitud POST del formulario
router.post('/', ContactosController.add);

// Definir la ruta para mostrar la página de éxito
router.get('/success', function(req, res) {
  res.render('success');
});

module.exports = router;
