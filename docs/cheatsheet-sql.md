# Cheatsheet SQL

Riferimento rapido per i comandi SQL usati nel progetto.

## SELECT — Leggere dati

```sql
-- Tutti gli utenti
SELECT * FROM utenti;

-- Un solo utente per ID
SELECT * FROM utenti WHERE id = 1;

-- Filtro case-insensitive (ignora maiuscole/minuscole)
SELECT * FROM utenti WHERE LOWER(citta) = LOWER('roma');

-- Filtrare per chiave esterna
SELECT * FROM post WHERE userId = 2;
SELECT * FROM commenti WHERE postId = 4;

-- Contare le righe
SELECT COUNT(*) FROM commenti;
```

## INSERT — Creare dati

```sql
-- Inserire un nuovo utente
INSERT INTO utenti (nome, email, citta) VALUES ('Yoshi Verde', 'yoshi@email.com', 'Isola Yoshi');

-- Inserire un nuovo post
INSERT INTO post (userId, titolo, corpo) VALUES (1, 'Nuovo post', 'Contenuto...');

-- Inserire un nuovo commento
INSERT INTO commenti (postId, nome, email, corpo) VALUES (1, 'Mario', 'mario@email.com', 'Bel post!');
```

**Nota:** non passiamo l'`id` — MySQL lo genera automaticamente grazie ad `AUTO_INCREMENT`.

## UPDATE — Modificare dati

```sql
-- Sostituire tutti i campi di un utente (PUT)
UPDATE utenti SET nome = 'Mario Rossi Jr.', email = 'mario.jr@email.com', citta = 'Milano' WHERE id = 1;

-- Aggiornare solo un campo (PATCH)
UPDATE utenti SET email = 'nuova@email.com' WHERE id = 1;

-- Aggiornare più campi
UPDATE post SET titolo = 'Titolo aggiornato', corpo = 'Nuovo contenuto' WHERE id = 3;
```

**Importante:** mettete **sempre** la clausola `WHERE`! Senza WHERE, aggiornereste TUTTE le righe della tabella.

## DELETE — Eliminare dati

```sql
-- Eliminare un utente
DELETE FROM utenti WHERE id = 5;

-- Eliminare un commento
DELETE FROM commenti WHERE id = 10;
```

**Importante:** anche qui, mettete **sempre** la clausola `WHERE`!

**Attenzione CASCADE:** nel nostro progetto, eliminare un utente elimina anche i suoi post, e eliminare un post elimina anche i suoi commenti. Questo succede grazie a `ON DELETE CASCADE` definito nello schema.

## Query parametrizzate (con Node.js)

Nel codice non scriviamo mai i valori direttamente nella query. Usiamo i **placeholder** `?`:

```js
// ✅ CORRETTO — query parametrizzata (sicura)
const [righe] = await pool.query(
    "SELECT * FROM utenti WHERE id = ?",
    [id]
);

// ❌ SBAGLIATO — concatenazione di stringhe (vulnerabile a SQL injection!)
const [righe] = await pool.query(
    `SELECT * FROM utenti WHERE id = ${id}`  // MAI fare questo!
);
```

I `?` vengono sostituiti automaticamente da `mysql2` con i valori dell'array. Questo previene attacchi di **SQL injection**.

### Più parametri

```js
// I ? vengono sostituiti in ordine con i valori dell'array
const [risultato] = await pool.query(
    "INSERT INTO utenti (nome, email, citta) VALUES (?, ?, ?)",
    [nome, email, citta]
);
```

## Risultati delle query in Node.js

### SELECT → array di righe

```js
const [righe] = await pool.query("SELECT * FROM utenti");
// righe = [{ id: 1, nome: "Mario", ... }, { id: 2, nome: "Luigi", ... }]

// Per un singolo elemento:
const [righe] = await pool.query("SELECT * FROM utenti WHERE id = ?", [1]);
// righe[0] = { id: 1, nome: "Mario", ... }
// righe[0] è undefined se non trovato
```

### INSERT → risultato con insertId

```js
const [risultato] = await pool.query(
    "INSERT INTO utenti (nome, email, citta) VALUES (?, ?, ?)",
    ["Yoshi", "yoshi@email.com", "Isola"]
);
// risultato.insertId = 6  (l'id generato da AUTO_INCREMENT)
```

### UPDATE / DELETE → risultato con affectedRows

```js
const [risultato] = await pool.query(
    "UPDATE utenti SET nome = ? WHERE id = ?",
    ["Mario Jr.", 1]
);
// risultato.affectedRows = 1  (una riga modificata)
// risultato.affectedRows = 0  (nessuna riga trovata con quell'id)
```

## Tipi di dati usati nel progetto

| Tipo SQL         | Significato                 | Esempio nel progetto       |
|------------------|-----------------------------|----------------------------|
| `INT`            | Numero intero               | `id`, `userId`, `postId`   |
| `VARCHAR(100)`   | Testo fino a 100 caratteri  | `nome`, `email`, `citta`   |
| `VARCHAR(255)`   | Testo fino a 255 caratteri  | `titolo`                   |
| `TEXT`           | Testo lungo                 | `corpo`                    |

## Vincoli (constraints)

| Vincolo            | Significato                                              |
|--------------------|----------------------------------------------------------|
| `PRIMARY KEY`      | Identifica in modo univoco ogni riga                     |
| `NOT NULL`         | Il campo è obbligatorio                                  |
| `AUTO_INCREMENT`   | MySQL genera il valore automaticamente (per gli id)      |
| `DEFAULT ''`       | Valore predefinito se non specificato                     |
| `FOREIGN KEY`      | Collega un campo a un'altra tabella                      |
| `ON DELETE CASCADE` | Se il record padre viene eliminato, anche i figli lo sono |
