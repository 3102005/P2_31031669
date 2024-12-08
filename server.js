const express = require('express');
const path = require('path');
const ContactosController = require('./ContactosController');

const app = express();
const contactosController = new ContactosController();

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', contactosController.router);

app.get('/confirmacion', (req, res) => {
    res.send('Contacto enviado exitosamente.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(Servidor corriendo en el puerto ${PORT});
});
