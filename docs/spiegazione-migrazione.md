# Spiegazione della Migrazione: da Array a MySQL

## Perche serviva un database?

Con il vecchio approccio (array in memoria), i dati:
- **Si perdevano** ad ogni riavvio del server
- **Non erano condivisibili** tra piu istanze del server
- **Non avevano vincoli** (potevi creare un post con `userId: 999` anche se l'utente non esisteva)

Con MySQL i dati sono **persistenti**, **condivisibili** e **validati** dal database stesso.

## Cosa e cambiato

### Prima: `data/database.js`

```
Route → Importa array + helper → Operazioni sincrone sugli array
```

```js
// Leggere tutti gli utenti
res.json(utenti);

// Cercare per id
const utente = trovaPerId(utenti, id);

// Creare un nuovo utente
const nuovoUtente = { id: prossimoId("utenti"), nome, email, citta };
utenti.push(nuovoUtente);

// Eliminare un utente
const [rimosso] = utenti.splice(indice, 1);
```

### Adesso: `database/queries/utenti.js`

```
Route → Importa funzioni query → Operazioni asincrone sul database MySQL
```

```js
// Leggere tutti gli utenti
const risultato = await trovaUtenti();

// Cercare per id
const utente = await trovaUtentePerId(id);

// Creare un nuovo utente (l'id lo genera MySQL con AUTO_INCREMENT)
const nuovoUtente = await creaUtente({ nome, email, citta });

// Eliminare un utente
const rimosso = await eliminaUtente(id);
```

## Tabella di confronto: Array vs MySQL

| Operazione       | Array (prima)                    | MySQL (adesso)                           |
|------------------|----------------------------------|------------------------------------------|
| Leggere tutti    | `utenti` (accesso diretto)       | `SELECT * FROM utenti`                   |
| Filtrare         | `.filter(u => u.citta === ...)`  | `WHERE LOWER(citta) = LOWER(?)`          |
| Cercare per id   | `.find(u => u.id === id)`        | `WHERE id = ?`                           |
| Creare           | `prossimoId()` + `.push()`       | `INSERT INTO ... VALUES (?, ?)`          |
| Aggiornare tutto | `array[indice] = { ... }`        | `UPDATE ... SET ... WHERE id = ?`        |
| Aggiornare campo | `utente.nome = nome`             | `UPDATE ... SET nome = ? WHERE id = ?`   |
| Eliminare        | `.splice(indice, 1)`             | `DELETE FROM ... WHERE id = ?`           |
| Generare ID      | `contatori[risorsa]++`           | `AUTO_INCREMENT` (lo fa MySQL)           |

## Concetti nuovi introdotti

### 1. async/await

Le operazioni sul database sono **asincrone**: il server manda la query a MySQL e aspetta la risposta. Per gestire questo usiamo `async/await`:

```js
// Prima: sincrono (immediato)
router.get("/", (req, res) => {
    res.json(utenti);
});

// Adesso: asincrono (attende la risposta dal database)
router.get("/", async (req, res) => {
    const risultato = await trovaUtenti();
    res.json(risultato);
});
```

- `async` davanti alla funzione permette di usare `await` al suo interno
- `await` mette in pausa l'esecuzione finche la query non restituisce il risultato

### 2. try/catch

Le operazioni sul database possono fallire (connessione persa, errore SQL, ecc). Usiamo `try/catch` per catturare gli errori:

```js
router.get("/", async (req, res) => {
    try {
        const risultato = await trovaUtenti();
        res.json(risultato);
    } catch (errore) {
        console.error("Errore:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});
```

- Il codice dentro `try` viene eseguito normalmente
- Se qualcosa va storto, l'esecuzione salta dentro `catch`
- Il client riceve un errore `500` (Internal Server Error)

### 3. Connection Pool

Aprire una connessione al database per ogni richiesta e lento. Un **pool** mantiene un gruppo di connessioni aperte e le riutilizza:

```js
const pool = mysql.createPool({
    host: "localhost",
    user: "studente",
    password: "password123",
    database: "mini_jsonplaceholder",
    connectionLimit: 10,  // massimo 10 connessioni simultanee
});
```

Quando una route fa `await pool.query(...)`, il pool:
1. Prende una connessione libera dal gruppo
2. Esegue la query
3. Restituisce la connessione al gruppo per riutilizzarla

### 4. Query parametrizzate

Usiamo i `?` come placeholder invece di concatenare stringhe:

```js
// ✅ Sicuro — mysql2 gestisce l'escaping dei valori
await pool.query("SELECT * FROM utenti WHERE id = ?", [id]);

// ❌ Vulnerabile a SQL injection
await pool.query(`SELECT * FROM utenti WHERE id = ${id}`);
```

Questo protegge da attacchi di **SQL injection**, dove un utente malintenzionato potrebbe inserire codice SQL nei parametri.

### 5. Variabili d'ambiente (.env)

Le credenziali del database non vanno mai scritte direttamente nel codice. Le mettiamo in un file `.env`:

```
DB_HOST=localhost
DB_USER=studente
DB_PASSWORD=password123
```

E le leggiamo nel codice con `process.env`:

```js
import "dotenv/config";  // Carica il file .env

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});
```

Il file `.env` e nel `.gitignore` — non viene committato su Git per sicurezza.

### 6. Foreign Keys e CASCADE

Le tabelle sono collegate tra loro:

```
utenti ←── post ←── commenti
        userId    postId
```

Nello schema SQL:

```sql
FOREIGN KEY (userId) REFERENCES utenti(id) ON DELETE CASCADE
```

Questo significa:
- Non puoi creare un post con un `userId` che non esiste
- Se elimini un utente, **tutti i suoi post vengono eliminati automaticamente**
- E i commenti di quei post vengono eliminati a catena

Questo e un comportamento **nuovo** rispetto al vecchio approccio con array, dove potevi eliminare un utente senza toccare i suoi post.

## Struttura dei file

```
api/
├── data/
│   └── database.vecchio.js   ← Il vecchio approccio (riferimento)
├── database/
│   ├── connessione.js         ← Pool di connessioni MySQL
│   ├── schema.sql             ← CREATE TABLE (struttura)
│   ├── seed.sql               ← INSERT (dati iniziali)
│   └── queries/
│       ├── utenti.js          ← Funzioni SQL per utenti
│       ├── post.js            ← Funzioni SQL per post
│       └── commenti.js        ← Funzioni SQL per commenti
└── routes/
    ├── utenti.js              ← Ora usa queries/utenti.js
    ├── post.js                ← Ora usa queries/post.js
    └── commenti.js            ← Ora usa queries/commenti.js
```

La separazione e chiara:
- **`database/connessione.js`** — come ci colleghiamo al database
- **`database/queries/*.js`** — cosa chiediamo al database (le query SQL)
- **`routes/*.js`** — come gestiamo le richieste HTTP (validazione, risposte)
