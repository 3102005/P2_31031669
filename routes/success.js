var express = require('express');
var router = express.Router();

// Definir la ruta para mostrar la página de éxito
router.get('/', function(req, res) {
  res.render('success');
});

module.exports = router;
