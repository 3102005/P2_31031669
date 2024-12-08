const ContactosModel = require('../models/contactosModel');
const contactosModel = new ContactosModel();
const { DateTime } = require('luxon');

class ContactosController {
  static add(req, res) {
    const { email, nombre, comentario } = req.body;
    const ip = req.ip;
    const fechaHora = DateTime.now().toISO();

    if (email && nombre && comentario) {
      contactosModel.guardarContacto(email, nombre, comentario, ip, fechaHora, (id) => {
        res.redirect('/success');
      });
    } else {
      res.status(400).send('Formulario Incompleto');
    }
  }
}

module.exports = ContactosController;
