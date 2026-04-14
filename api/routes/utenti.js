// routes/utenti.js — Route per la risorsa Utenti
//
// Endpoint completo: /api/utenti (il prefisso è montato in server.js)
//
// Versione aggiornata: usa MySQL invece degli array in memoria.
// Ogni handler è async e usa try/catch per gestire errori del database.

import { Router } from "express";
import {
    trovaUtenti, trovaUtentePerId, creaUtente,
    sostituisciUtente, aggiornaUtente, eliminaUtente
} from "../database/queries/utenti.js";

const router = Router();

// ============================================================
// GET /api/utenti — Lista tutti gli utenti
// ============================================================
// Supporta un filtro opzionale per città: /api/utenti?citta=Roma
//
// Prima (array):    utenti.filter(u => u.citta === citta)
// Adesso (MySQL):   SELECT * FROM utenti WHERE LOWER(citta) = LOWER(?)

router.get("/", async (req, res) => {
    try {
        const { citta } = req.query;
        const risultato = await trovaUtenti(citta);
        res.json(risultato);
    } catch (errore) {
        console.error("Errore GET /api/utenti:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

// ============================================================
// GET /api/utenti/:id — Singolo utente
// ============================================================
//
// Prima (array):    trovaPerId(utenti, id)
// Adesso (MySQL):   SELECT * FROM utenti WHERE id = ?

router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const utente = await trovaUtentePerId(id);

        if (!utente) {
            return res.status(404).json({
                errore: `Utente con id ${id} non trovato`
            });
        }

        res.json(utente);
    } catch (errore) {
        console.error("Errore GET /api/utenti/:id:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

// ============================================================
// POST /api/utenti — Crea un nuovo utente
// ============================================================
// Campi obbligatori nel body: "nome", "email"
// Campo opzionale: "citta" (default: stringa vuota "")
//
// Prima (array):    prossimoId("utenti") + utenti.push()
// Adesso (MySQL):   INSERT INTO utenti (...) VALUES (?, ?, ?)
//                   L'id viene generato da AUTO_INCREMENT

router.post("/", async (req, res) => {
    try {
        const { nome, email, citta } = req.body;

        if (!nome || !email) {
            return res.status(400).json({
                errore: "I campi 'nome' e 'email' sono obbligatori"
            });
        }

        const nuovoUtente = await creaUtente({ nome, email, citta });
        res.status(201).json(nuovoUtente);
    } catch (errore) {
        console.error("Errore POST /api/utenti:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

// ============================================================
// PUT /api/utenti/:id — Sostituisce un utente
// ============================================================
// Campi obbligatori nel body: "nome", "email"
//
// Prima (array):    utenti[indice] = { id, nome, email, citta }
// Adesso (MySQL):   UPDATE utenti SET nome=?, email=?, citta=? WHERE id=?

router.put("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nome, email, citta } = req.body;

        if (!nome || !email) {
            return res.status(400).json({
                errore: "I campi 'nome' e 'email' sono obbligatori"
            });
        }

        const aggiornato = await sostituisciUtente(id, { nome, email, citta });

        if (!aggiornato) {
            return res.status(404).json({
                errore: `Utente con id ${id} non trovato`
            });
        }

        res.json(aggiornato);
    } catch (errore) {
        console.error("Errore PUT /api/utenti/:id:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

// ============================================================
// PATCH /api/utenti/:id — Aggiorna parzialmente
// ============================================================
// Accetta uno o più campi. Aggiorna solo quelli presenti.
//
// Prima (array):    if (nome !== undefined) utente.nome = nome;
// Adesso (MySQL):   UPDATE utenti SET <campo>=? WHERE id=? (query dinamica)

router.patch("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nome, email, citta } = req.body;

        const utente = await aggiornaUtente(id, { nome, email, citta });

        if (!utente) {
            return res.status(404).json({
                errore: `Utente con id ${id} non trovato`
            });
        }

        res.json(utente);
    } catch (errore) {
        console.error("Errore PATCH /api/utenti/:id:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

// ============================================================
// DELETE /api/utenti/:id — Elimina un utente
// ============================================================
//
// Prima (array):    utenti.splice(indice, 1)
// Adesso (MySQL):   DELETE FROM utenti WHERE id = ?
//
// Nota: grazie a ON DELETE CASCADE, eliminando un utente
// vengono eliminati automaticamente anche i suoi post e commenti.

router.delete("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const rimosso = await eliminaUtente(id);

        if (!rimosso) {
            return res.status(404).json({
                errore: `Utente con id ${id} non trovato`
            });
        }

        res.json({ messaggio: "Utente eliminato", utente: rimosso });
    } catch (errore) {
        console.error("Errore DELETE /api/utenti/:id:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

export default router;
