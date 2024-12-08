const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('contactos.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS contactos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    nombre TEXT NOT NULL,
    comentario TEXT NOT NULL,
    ip TEXT NOT NULL,
    fecha_hora TEXT NOT NULL
  )`, (err) => {
    if (err) {
      console.error("Error creating table", err.message);
    } else {
      console.log("Table created successfully");
    }
  });
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Database connection closed");
  }
});
