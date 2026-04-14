# Esercizi

Esercizi progressivi per estendere il Mini JSONPlaceholder. Ogni esercizio indica la difficolta e i file da modificare.

Difficolta: ⭐ facile | ⭐⭐ medio | ⭐⭐⭐ avanzato

---

## Esercizio 1 — Estendere lo schema Utenti ⭐⭐

### Obiettivo

Aggiungere nuovi campi alla tabella `utenti`:

| Campo             | Tipo SQL         | Obbligatorio | Note                                           |
|-------------------|------------------|--------------|-------------------------------------------------|
| `codiceFiscale`   | `CHAR(16)`       | Si           | Esattamente 16 caratteri alfanumerici           |
| `sesso`           | `ENUM('M','F','Altro')` | Si    | Solo uno dei tre valori possibili               |
| `dataNascita`     | `DATE`           | No           | Formato: `YYYY-MM-DD` (es. `1990-05-15`)       |
| `telefono`        | `VARCHAR(20)`    | No           | Numeri, spazi, e prefisso `+` internazionale    |

### File da modificare

1. **`api/database/schema.sql`** — aggiungere le colonne nella `CREATE TABLE utenti`
2. **`api/database/seed.sql`** — aggiornare gli INSERT con i nuovi campi (inventate i dati)
3. **`api/database/queries/utenti.js`** — aggiornare tutte le funzioni (INSERT, UPDATE) per includere i nuovi campi
4. **`api/routes/utenti.js`** — aggiornare la validazione: `codiceFiscale` e `sesso` sono obbligatori nel POST e PUT

### Suggerimenti

Per la modifica dello schema, la colonna `sesso` usa un tipo speciale:

```sql
sesso ENUM('M', 'F', 'Altro') NOT NULL
```

`ENUM` accetta solo i valori elencati — MySQL rifiuta qualsiasi altro valore.

Dopo aver modificato schema e seed, ricordate di ricreare il database:

```bash
docker compose down -v
docker compose up -d
```

### Verifica

- `POST /api/utenti` con `codiceFiscale` e `sesso` mancanti → deve restituire `400`
- `POST /api/utenti` con tutti i campi → deve restituire `201` con i nuovi campi inclusi
- `GET /api/utenti` → ogni utente deve avere i nuovi campi
- In phpMyAdmin (http://localhost:8081), verificate che la tabella abbia le nuove colonne

---

## Esercizio 2 — Validazione Codice Fiscale nel Frontend ⭐⭐

### Obiettivo

Aggiungere i nuovi campi al form "Nuovo Utente" nel frontend, con validazione del codice fiscale tramite regex.

Il codice fiscale italiano ha questo formato: **6 lettere + 2 numeri + 1 lettera + 2 numeri + 1 lettera + 3 numeri + 1 lettera**

Regex semplificata: `^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$`

### File da modificare

1. **`web/index.html`** — aggiungere i campi nel form `#form-utente`:
   - Codice Fiscale: `<input>` con `pattern` e `maxlength="16"`
   - Sesso: `<select>` con le opzioni M / F / Altro
   - Data di Nascita: `<input type="date">`
   - Telefono: `<input type="tel">`

2. **`web/js/app.js`** — aggiornare il listener `submit` del form utente per:
   - Leggere i nuovi campi dal form
   - Validare il codice fiscale con la regex **prima** di inviare la richiesta
   - Mostrare un errore se il formato non e valido
   - Passare tutti i campi alla funzione `api.creaUtente()`

3. **`web/js/api.js`** — la funzione `creaUtente` riceve gia un oggetto `dati` e lo invia come body, quindi non dovrebbe servire nessuna modifica

4. **`web/js/ui.js`** — aggiornare `mostraUtenti()` per visualizzare i nuovi campi nelle card

### Suggerimenti

Per la validazione nel form HTML, potete usare l'attributo `pattern`:

```html
<input type="text"
       id="utente-cf"
       placeholder="Es. RSSMRA90A01H501A"
       pattern="^[A-Za-z]{6}[0-9]{2}[A-Za-z][0-9]{2}[A-Za-z][0-9]{3}[A-Za-z]$"
       maxlength="16"
       required>
```

Per la validazione in JavaScript (in `app.js`):

```js
const regexCF = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
const cfUppercase = codiceFiscale.toUpperCase();

if (!regexCF.test(cfUppercase)) {
    ui.mostraErrore("Codice fiscale non valido", lista);
    return;
}
```

Per il campo sesso nel HTML:

```html
<label for="utente-sesso">Sesso</label>
<select id="utente-sesso" required>
    <option value="">-- Seleziona --</option>
    <option value="M">Maschio</option>
    <option value="F">Femmina</option>
    <option value="Altro">Altro</option>
</select>
```

### Verifica

- Compilate il form con un codice fiscale non valido (es. `ABC123`) → deve mostrare un errore
- Compilate il form con un codice fiscale valido (es. `RSSMRA90A01H501A`) → deve creare l'utente
- I nuovi campi devono apparire nelle card degli utenti

---

## Esercizio 3 — Modifica Utente (bottone "Modifica") ⭐⭐⭐

### Obiettivo

Aggiungere un bottone "Modifica" ad ogni card utente. Cliccandolo, il form "Nuovo Utente" si trasforma in un form "Modifica Utente" con i dati pre-compilati. Al submit, viene inviata una richiesta `PUT` invece di `POST`.

### Comportamento atteso

1. L'utente clicca "Modifica" su una card
2. Il form si popola con i dati dell'utente selezionato
3. Il titolo del form cambia da "Nuovo Utente" a "Modifica Utente"
4. Appare un bottone "Annulla" per tornare alla modalita creazione
5. Il bottone submit cambia testo: "Crea Utente" → "Salva Modifiche"
6. Al submit, viene chiamata una funzione API che fa `PUT /api/utenti/:id`
7. Dopo il salvataggio, il form torna alla modalita creazione

### File da modificare

1. **`web/js/api.js`** — aggiungere la funzione:
   ```js
   export async function aggiornaUtente(id, dati) {
       return chiamataApi(`/utenti/${id}`, {
           method: "PUT",
           body: JSON.stringify(dati),
       });
   }
   ```

2. **`web/js/ui.js`** — aggiungere il bottone "Modifica" nelle card utenti:
   ```html
   <button class="btn-secondario" data-azione="modifica">Modifica</button>
   ```
   Aggiungere il callback `onModifica` nei callbacks.

3. **`web/js/app.js`** — gestire la logica modifica/creazione:
   - Creare una variabile `let utenteInModifica = null`
   - Quando si clicca "Modifica": salvare l'utente in `utenteInModifica`, popolare il form, cambiare il titolo e il bottone
   - Nel listener `submit`: controllare `utenteInModifica` — se presente, fare PUT; altrimenti, fare POST
   - Creare una funzione `resetFormUtente()` per tornare alla modalita creazione

4. **`web/stile.css`** — aggiungere lo stile per `.btn-secondario`:
   ```css
   .btn-secondario {
       background: #f1f5f9;
       color: #1e293b;
       border: 1px solid #e2e8f0;
   }
   .btn-secondario:hover {
       background: #e2e8f0;
   }
   ```

5. **`web/index.html`** — aggiungere un bottone "Annulla" nascosto nel form (che appare solo in modalita modifica)

### Suggerimenti

Per pre-compilare il form:

```js
function compilaFormUtente(utente) {
    document.getElementById("utente-nome").value = utente.nome;
    document.getElementById("utente-email").value = utente.email;
    document.getElementById("utente-citta").value = utente.citta;
    // ... altri campi
}
```

Per distinguere creazione da modifica nel submit:

```js
document.getElementById("form-utente").addEventListener("submit", async (e) => {
    e.preventDefault();
    // ... leggi i campi ...

    if (utenteInModifica) {
        await api.aggiornaUtente(utenteInModifica.id, dati);
        utenteInModifica = null;
        resetFormUtente();
    } else {
        await api.creaUtente(dati);
    }
    // ... ricarica lista ...
});
```

### Verifica

- Cliccate "Modifica" su un utente → il form si popola con i suoi dati
- Cambiate il nome e salvate → la card deve aggiornarsi
- Cliccate "Annulla" → il form torna vuoto in modalita creazione
- In phpMyAdmin, verificate che i dati siano stati aggiornati nella tabella

---

## Esercizio 4 — Filtro di ricerca utenti ⭐

### Obiettivo

Aggiungere un campo di ricerca sopra la lista utenti che filtra le card in tempo reale mentre si digita.

### Comportamento atteso

- Un campo `<input>` con placeholder "Cerca utenti..."
- Mentre l'utente digita, le card si filtrano per nome, email o citta
- Il filtro e case-insensitive
- Se il campo e vuoto, tutte le card sono visibili

### File da modificare

1. **`web/index.html`** — aggiungere l'input di ricerca prima di `#lista-utenti`
2. **`web/js/app.js`** — aggiungere un listener `input` che filtra lato client

### Suggerimenti

Il filtro funziona lato client (non serve chiamare l'API):

```js
document.getElementById("ricerca-utenti").addEventListener("input", (e) => {
    const testo = e.target.value.toLowerCase();
    const cards = document.querySelectorAll("#lista-utenti .card");

    cards.forEach(card => {
        const contenuto = card.textContent.toLowerCase();
        card.style.display = contenuto.includes(testo) ? "" : "none";
    });
});
```

### Verifica

- Digitate "roma" → solo gli utenti di Roma sono visibili
- Cancellate il testo → tutte le card riappaiono
- Digitate "mario" → solo Mario Rossi e visibile

---

## Esercizio 5 — Contatore statistiche ⭐

### Obiettivo

Aggiungere una barra con le statistiche sotto la navigazione:

```
Utenti: 5 | Post: 8 | Commenti: 10
```

I numeri si aggiornano automaticamente quando create o eliminate risorse.

### File da modificare

1. **`web/index.html`** — aggiungere un `<div id="statistiche">` dopo `<nav>`
2. **`web/js/app.js`** — creare una funzione `aggiornaStatistiche()` che chiama le 3 API GET e aggiorna i contatori. Chiamarla dopo ogni operazione CRUD.

### Suggerimenti

```js
async function aggiornaStatistiche() {
    const [utenti, post, commenti] = await Promise.all([
        api.ottieniUtenti(),
        api.ottieniPost(),
        api.ottieniCommenti()
    ]);
    document.getElementById("statistiche").textContent =
        `Utenti: ${utenti.length} | Post: ${post.length} | Commenti: ${commenti.length}`;
}
```

`Promise.all` esegue le 3 chiamate in parallelo — e piu veloce che farle una alla volta.

### Verifica

- All'avvio i numeri corrispondono ai dati nel database
- Create un nuovo utente → il contatore Utenti aumenta di 1
- Eliminate un post → il contatore Post diminuisce di 1

---

## Esercizio 6 — Timestamp "creato il" ⭐⭐

### Obiettivo

Aggiungere una colonna `creatoIl` (timestamp) a tutte e tre le tabelle. MySQL la compila automaticamente al momento dell'inserimento.

### File da modificare

1. **`api/database/schema.sql`** — aggiungere a ogni tabella:
   ```sql
   creatoIl TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
   ```
2. **`web/js/ui.js`** — mostrare la data nelle card in formato leggibile

### Suggerimenti

Per formattare la data nel frontend:

```js
const data = new Date(elemento.creatoIl);
const formattata = data.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric"
});
// → "15 maggio 2026"
```

Non serve modificare le query INSERT — MySQL inserisce il timestamp automaticamente.

### Verifica

- Ricreate il database (`docker compose down -v && docker compose up -d`)
- `GET /api/utenti` → ogni utente ha il campo `creatoIl`
- Le card nel frontend mostrano la data in formato leggibile
- Create un nuovo utente → la data e quella di oggi

---

## Esercizio 7 — Paginazione API ⭐⭐⭐

### Obiettivo

Aggiungere la paginazione alla lista post. Invece di restituire tutti i post in una volta, l'API restituisce una pagina alla volta.

### Endpoint aggiornato

```
GET /api/post?pagina=1&limite=3
```

Risposta:

```json
{
    "dati": [ ... 3 post ... ],
    "meta": {
        "pagina": 1,
        "limite": 3,
        "totale": 8,
        "pagine": 3
    }
}
```

### File da modificare

1. **`api/database/queries/post.js`** — aggiornare `trovaPost()` per accettare parametri di paginazione e usare `LIMIT` e `OFFSET`:
   ```sql
   SELECT * FROM post LIMIT ? OFFSET ?
   SELECT COUNT(*) as totale FROM post
   ```
2. **`api/routes/post.js`** — leggere `pagina` e `limite` dalla query string, passarli alla query
3. **`web/js/app.js`** — aggiungere bottoni "Precedente" / "Successiva" sotto la lista post

### Suggerimenti

La formula per calcolare l'offset:

```js
const offset = (pagina - 1) * limite;
// Pagina 1, limite 3 → offset 0 (parti dal primo)
// Pagina 2, limite 3 → offset 3 (salta i primi 3)
```

Il numero totale di pagine:

```js
const pagine = Math.ceil(totale / limite);
```

### Verifica

- `GET /api/post?pagina=1&limite=3` → restituisce i primi 3 post
- `GET /api/post?pagina=3&limite=3` → restituisce gli ultimi 2 post
- `GET /api/post` (senza parametri) → restituisce tutti i post come prima (retrocompatibile)
- I bottoni nel frontend navigano tra le pagine

---

## Ordine consigliato

1. **Esercizio 4** (Filtro ricerca) — solo frontend, rapido
2. **Esercizio 5** (Statistiche) — solo frontend, introduce `Promise.all`
3. **Esercizio 1** (Schema utenti) — backend, introduce ALTER TABLE / nuove colonne
4. **Esercizio 2** (Validazione CF) — frontend, introduce regex e `<select>`
5. **Esercizio 6** (Timestamp) — full-stack leggero, introduce TIMESTAMP
6. **Esercizio 3** (Modifica utente) — full-stack, il piu complesso finora
7. **Esercizio 7** (Paginazione) — full-stack avanzato, introduce LIMIT/OFFSET

Ogni esercizio costruisce sulle competenze dell'esercizio precedente.
