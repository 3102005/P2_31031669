<<<<<<< HEAD
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';

export class ContactsModel {
    private db: Database | null = null;

    constructor() {
=======
import { DatabaseFacade } from '../facades/DatabaseFacade';

export class ContactsModel {
    private db: DatabaseFacade;

    constructor() {
        this.db = new DatabaseFacade();
>>>>>>> 037c066598ee083c243bf8c7b8dc1650df720ef6
        this.initializeDB();
    }

    private async initializeDB() {
<<<<<<< HEAD
        this.db = await open({
            filename: './contacts.db',
            driver: sqlite3.Database
        });

        await this.db.exec(`
=======
        await this.db.initialize();
        await this.db.runQuery(`
>>>>>>> 037c066598ee083c243bf8c7b8dc1650df720ef6
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                name TEXT NOT NULL,
                comment TEXT NOT NULL,
                ip_address TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

<<<<<<< HEAD
    public async add(
        email: string,
        name: string,
        comment: string,
        ipAddress: string
    ) {
        if (!this.db) throw new Error('Database not initialized');

        const result = await this.db.run(
            `INSERT INTO contacts (email, name, comment, ip_address)
             VALUES (?, ?, ?, ?)`,
=======
    public async add(email: string, name: string, comment: string, ipAddress: string) {
        const result = await this.db.runQuery(
            `INSERT INTO contacts (email, name, comment, ip_address) VALUES (?, ?, ?, ?)`,
>>>>>>> 037c066598ee083c243bf8c7b8dc1650df720ef6
            [email, name, comment, ipAddress]
        );

        return {
            id: result.lastID,
            email,
            name,
            comment,
            ipAddress,
<<<<<<< HEAD
            createdAt: new Date().toISOString()
        };
    }
    
    public async get() {
        if (!this.db) throw new Error('Database not initialized');
        return this.db.all('SELECT * FROM contacts ORDER BY created_at DESC');
    }
}

=======
            createdAt: new Date().toISOString(),
        };
    }

    public async get() {
        return this.db.allQuery('SELECT * FROM contacts ORDER BY created_at DESC');
    }
}
>>>>>>> 037c066598ee083c243bf8c7b8dc1650df720ef6
