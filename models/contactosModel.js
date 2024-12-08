const sqlite3 = require('sqlite3').verbose();

class ContactosModel {
  constructor() {
    this.db = new sqlite3.Database('contactos.db');
  }

  guardarContacto(email, nombre, comentario, ip, fechaHora, callback) {
    const sql = `INSERT INTO contactos (email, nombre, comentario, ip, fecha_hora) VALUES (?, ?, ?, ?, ?)`;
    this.db.run(sql, [email, nombre, comentario, ip, fechaHora], function(err) {
      if (err) {
        return console.error(err.message);
      }
      callback(this.lastID);
    });
  }

  obtenerContactos(callback) {
    const sql = `SELECT * FROM contactos`;
    this.db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      callback(rows);
    });
  }
}

module.exports = ContactosModel;
