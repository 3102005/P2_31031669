import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcrypt';

export interface UserData {
  id?: number;
  username: string;
  password_hash: string;
  google_id?: string;
  email?: string;
  created_at?: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  google_id?: string;
  email?: string;
}

class UserModel {
  private static instance: UserModel;
  private db: sqlite3.Database;
  private adminCreated: boolean = false;

  private constructor() {
    const dbPath = path.join(process.cwd(), 'database.sqlite');
    this.db = new sqlite3.Database(dbPath);
    this.initializeTable();
  }

  public static getInstance(): UserModel {
    if (!UserModel.instance) {
      UserModel.instance = new UserModel();
    }
    return UserModel.instance;
  }

  private initializeTable(): void {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        google_id TEXT UNIQUE,
        email TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating users table:', err);
      } else {
        console.log('Users table initialized successfully');
        // Create default admin user if it doesn't exist
        if (!this.adminCreated) {
          this.adminCreated = true;
          this.createDefaultAdmin();
        }
      }
    });
  }

  private async createDefaultAdmin(): Promise<void> {
    try {
      const adminExists = await this.findByUsername('admin');
      if (!adminExists) {
        await this.createUser({
          username: 'admin',
          password: 'admin123',
          email: 'admin@patitasmoviles.com'
        });
        console.log('Default admin user created: admin/admin123');
      }
    } catch (error) {
      console.error('Error creating default admin:', error);
    }
  }

  public async createUser(userData: CreateUserData): Promise<number> {
    return new Promise(async (resolve, reject) => {
      try {
        let hashedPassword = null;
        if (userData.password) {
          hashedPassword = await bcrypt.hash(userData.password, 10);
        }

        const query = `
          INSERT INTO users (username, password_hash, google_id, email)
          VALUES (?, ?, ?, ?)
        `;

        this.db.run(
          query,
          [userData.username, hashedPassword, userData.google_id || null, userData.email || null],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve(this.lastID);
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  public async findByUsername(username: string): Promise<UserData | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE username = ?';
      
      this.db.get(query, [username], (err, row: UserData) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  public async findById(id: number): Promise<UserData | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE id = ?';
      
      this.db.get(query, [id], (err, row: UserData) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  public async findByGoogleId(googleId: string): Promise<UserData | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE google_id = ?';
      
      this.db.get(query, [googleId], (err, row: UserData) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  public async validatePassword(username: string, password: string): Promise<UserData | null> {
    try {
      const user = await this.findByUsername(username);
      if (!user || !user.password_hash) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      return isValid ? user : null;
    } catch (error) {
      console.error('Error validating password:', error);
      return null;
    }
  }

  public async getAllUsers(): Promise<UserData[]> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC';
      
      this.db.all(query, [], (err, rows: UserData[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  public async linkGoogleAccount(userId: number, googleId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE users SET google_id = ? WHERE id = ?';
      
      this.db.run(query, [googleId, userId], function(err) {
        if (err) {
          console.error('Error linking Google account:', err);
          reject(err);
        } else {
          console.log('✅ Google account linked successfully for user ID:', userId);
          resolve();
        }
      });
    });
  }

  public close(): void {
    this.db.close();
  }
}

export default UserModel;
