# Guida Setup MySQL con Docker

Questa guida spiega come configurare il database MySQL per il progetto Mini JSONPlaceholder.

## Prerequisiti

- **Docker Desktop** installato e avviato
  - Mac: [https://docs.docker.com/desktop/install/mac-install/](https://docs.docker.com/desktop/install/mac-install/)
  - Windows: [https://docs.docker.com/desktop/install/windows-install/](https://docs.docker.com/desktop/install/windows-install/)

## Passaggi

### 1. Avviare il database

Dalla **cartella principale** del progetto (dove c'è il file `docker-compose.yml`):

```bash
docker compose up -d
```

Cosa succede:
- Docker scarica l'immagine di MySQL 8 (solo la prima volta)
- Crea un container chiamato `mini-jsonplaceholder-db`
- Esegue automaticamente `schema.sql` (crea le tabelle) e `seed.sql` (inserisce i dati)
- Il database è accessibile sulla porta `3306`

Il flag `-d` ("detached") fa girare il container in background.

### 2. Verificare che funziona

```bash
docker ps
```

Dovreste vedere due container con stato `Up`:
- `mini-jsonplaceholder-db` (MySQL)
- `mini-jsonplaceholder-phpmyadmin` (phpMyAdmin)

### phpMyAdmin — interfaccia visuale

Aprite il browser su **http://localhost:8081** per accedere a phpMyAdmin. Le credenziali sono pre-configurate, quindi entrerete direttamente nel database. Da qui potete:
- Vedere le tabelle e i dati
- Eseguire query SQL
- Aggiungere/modificare/eliminare righe manualmente

### Alternativa: terminale MySQL

Per connettervi al database da terminale:

```bash
docker exec -it mini-jsonplaceholder-db mysql -u studente -ppassword123 mini_jsonplaceholder
```

Una volta dentro MySQL, provate:

```sql
SELECT * FROM utenti;
SELECT * FROM post WHERE userId = 1;
SELECT COUNT(*) FROM commenti;
```

Digitate `exit` per uscire.

### 3. Configurare le variabili d'ambiente

Nella cartella `api/`, copiate il file `.env.example`:

```bash
cd api
cp .env.example .env
```

Il file `.env` contiene le credenziali per connettersi al database. I valori di default sono già configurati per funzionare con Docker:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=studente
DB_PASSWORD=password123
DB_NAME=mini_jsonplaceholder
```

> **Importante:** il file `.env` non va committato su Git (è nel `.gitignore`) perché contiene credenziali.

### 4. Installare le dipendenze

```bash
cd api
npm install
```

Questo installa i nuovi pacchetti `mysql2` (driver MySQL) e `dotenv` (legge il file `.env`).

### 5. Avviare il server

```bash
npm run dev
```

Se tutto funziona, vedrete il messaggio di avvio e le richieste API leggeranno/scriveranno dal database MySQL.

## Comandi Docker utili

```bash
# Avviare il database
docker compose up -d

# Fermare il database
docker compose down

# Fermare e CANCELLARE tutti i dati (ricrea le tabelle al prossimo avvio)
docker compose down -v

# Vedere i log del database
docker logs mini-jsonplaceholder-db

# Connettersi al database
docker exec -it mini-jsonplaceholder-db mysql -u studente -ppassword123 mini_jsonplaceholder
```

## Risoluzione problemi

### "Port 3306 already in use"

Avete già un MySQL locale in esecuzione. Opzioni:
1. Fermate il MySQL locale
2. Oppure cambiate la porta nel `docker-compose.yml`: `"3307:3306"` e aggiornate `DB_PORT=3307` nel `.env`

### "Can't connect to MySQL server"

- Verificate che Docker Desktop sia avviato
- Verificate che il container sia attivo: `docker ps`
- Se il container non c'è, avviatelo: `docker compose up -d`

### "Access denied for user"

Verificate che le credenziali nel `.env` corrispondano a quelle nel `docker-compose.yml`.

### Dati scomparsi o corrotti

Se volete ripartire da zero con dati puliti:

```bash
docker compose down -v    # Cancella il volume con i dati
docker compose up -d      # Ricrea tutto da schema.sql + seed.sql
```
