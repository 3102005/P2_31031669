var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('Hola mundo, Cristhian Alfonzo Angyalbert Padron Alvarez C.I: 31031669 Seccion: 4');
});

module.exports = router;
