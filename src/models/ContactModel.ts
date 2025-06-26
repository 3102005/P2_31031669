import sqlite3 from 'sqlite3';
import path from 'path';

export interface ContactData {
  id?: number;
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
  ip_address: string;
  pais: string;
  ciudad?: string;
  fecha_creacion: string;
}

class ContactModel {
  private db: sqlite3.Database;

  constructor() {
    const dbPath = path.join(process.cwd(), 'database.sqlite');
    this.db = new sqlite3.Database(dbPath);
    this.initializeTable();
  }

  private initializeTable(): void {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS contactos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL,
        telefono TEXT,
        mensaje TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        pais TEXT NOT NULL,
        ciudad TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating contactos table:', err);
      } else {
        console.log('Contactos table initialized successfully');
      }
    });
  }

  public async createContact(contactData: Omit<ContactData, 'id' | 'fecha_creacion'>): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO contactos (nombre, email, telefono, mensaje, ip_address, pais, ciudad)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(
        query,
        [contactData.nombre, contactData.email, contactData.telefono, contactData.mensaje, 
         contactData.ip_address, contactData.pais, contactData.ciudad],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  public async getAllContacts(): Promise<ContactData[]> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM contactos ORDER BY fecha_creacion DESC';
      
      this.db.all(query, [], (err, rows: ContactData[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  public async getContactById(id: number): Promise<ContactData | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM contactos WHERE id = ?';
      
      this.db.get(query, [id], (err, row: ContactData) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  public close(): void {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

export default ContactModel;
