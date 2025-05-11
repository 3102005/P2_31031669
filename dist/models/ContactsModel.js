"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
<<<<<<< HEAD
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsModel = void 0;
const sqlite_1 = require("sqlite");
const sqlite3_1 = __importDefault(require("sqlite3"));
class ContactsModel {
    constructor() {
        this.db = null;
=======
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsModel = void 0;
const DatabaseFacade_1 = require("../facades/DatabaseFacade");
class ContactsModel {
    constructor() {
        this.db = new DatabaseFacade_1.DatabaseFacade();
>>>>>>> 037c066598ee083c243bf8c7b8dc1650df720ef6
        this.initializeDB();
    }
    initializeDB() {
        return __awaiter(this, void 0, void 0, function* () {
<<<<<<< HEAD
            this.db = yield (0, sqlite_1.open)({
                filename: './contacts.db',
                driver: sqlite3_1.default.Database
            });
            yield this.db.exec(`
=======
            yield this.db.initialize();
            yield this.db.runQuery(`
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
        });
    }
    add(email, name, comment, ipAddress) {
        return __awaiter(this, void 0, void 0, function* () {
<<<<<<< HEAD
            if (!this.db)
                throw new Error('Database not initialized');
            const result = yield this.db.run(`INSERT INTO contacts (email, name, comment, ip_address)
             VALUES (?, ?, ?, ?)`, [email, name, comment, ipAddress]);
=======
            const result = yield this.db.runQuery(`INSERT INTO contacts (email, name, comment, ip_address) VALUES (?, ?, ?, ?)`, [email, name, comment, ipAddress]);
>>>>>>> 037c066598ee083c243bf8c7b8dc1650df720ef6
            return {
                id: result.lastID,
                email,
                name,
                comment,
                ipAddress,
<<<<<<< HEAD
                createdAt: new Date().toISOString()
=======
                createdAt: new Date().toISOString(),
>>>>>>> 037c066598ee083c243bf8c7b8dc1650df720ef6
            };
        });
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
<<<<<<< HEAD
            if (!this.db)
                throw new Error('Database not initialized');
            return this.db.all('SELECT * FROM contacts ORDER BY created_at DESC');
=======
            return this.db.allQuery('SELECT * FROM contacts ORDER BY created_at DESC');
>>>>>>> 037c066598ee083c243bf8c7b8dc1650df720ef6
        });
    }
}
exports.ContactsModel = ContactsModel;
