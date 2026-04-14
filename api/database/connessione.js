// database/connessione.js — Connessione al database MySQL
//
// Crea un "pool" di connessioni usando mysql2.
// Un pool riutilizza le connessioni invece di crearne una nuova ogni volta.
// Tutte le query del progetto passano da qui.
//
// Le credenziali vengono lette dal file .env tramite il pacchetto dotenv.

import mysql from "mysql2/promise";
import "dotenv/config";

const pool = mysql.createPool({
    host:     process.env.DB_HOST || "localhost",
    port:     parseInt(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER || "studente",
    password: process.env.DB_PASSWORD || "password123",
    database: process.env.DB_NAME || "mini_jsonplaceholder",

    // Numero massimo di connessioni simultanee nel pool
    connectionLimit: 10,
});

export default pool;
