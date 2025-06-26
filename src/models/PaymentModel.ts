import sqlite3 from 'sqlite3';
import path from 'path';

interface PaymentData {
  id?: number;
  email: string;
  cardHolderName: string;
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
  amount: number;
  currency: string;
  service: string;
  ipAddress: string;
  status?: string;
  transactionId?: string;
  createdAt?: string;
}

class PaymentModel {
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'database.sqlite');
    this.initializeTable();
  }

  private initializeTable(): void {
    const db = new sqlite3.Database(this.dbPath);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        cardHolderName TEXT NOT NULL,
        cardNumber TEXT NOT NULL,
        expirationMonth TEXT NOT NULL,
        expirationYear TEXT NOT NULL,
        cvv TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        service TEXT NOT NULL,
        ipAddress TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        transactionId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating payments table:', err);
      } else {
        console.log('Payments table initialized successfully');
      }
    });
    
    db.close();
  }

  async create(paymentData: Omit<PaymentData, 'id' | 'createdAt'>): Promise<number> {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      
      const query = `
        INSERT INTO payments (
          email, cardHolderName, cardNumber, expirationMonth, 
          expirationYear, cvv, amount, currency, service, ipAddress, status, transactionId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [
        paymentData.email,
        paymentData.cardHolderName,
        paymentData.cardNumber,
        paymentData.expirationMonth,
        paymentData.expirationYear,
        paymentData.cvv,
        paymentData.amount,
        paymentData.currency,
        paymentData.service,
        paymentData.ipAddress,
        paymentData.status || 'PENDING',
        paymentData.transactionId || null
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
      
      db.close();
    });
  }

  async getAll(): Promise<PaymentData[]> {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      
      db.all('SELECT * FROM payments ORDER BY createdAt DESC', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as PaymentData[]);
        }
      });
      
      db.close();
    });
  }

  async getById(id: number): Promise<PaymentData | null> {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      
      db.get('SELECT * FROM payments WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as PaymentData || null);
        }
      });
      
      db.close();
    });
  }
}

export default PaymentModel;
export { PaymentData };
