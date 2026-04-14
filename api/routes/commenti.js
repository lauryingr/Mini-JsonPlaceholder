// routes/commenti.js — Route per la risorsa Commenti
//
// Endpoint completo: /api/commenti (il prefisso è montato in server.js)
//
// Versione aggiornata: usa MySQL invece degli array in memoria.

import { Router } from "express";
import {
    trovaCommenti, trovaCommentoPerId, creaCommento,
    sostituisciCommento, aggiornaCommento, eliminaCommento
} from "../database/queries/commenti.js";

const router = Router();

// ============================================================
// GET /api/commenti — Lista tutti i commenti
// ============================================================
// Filtro opzionale: /api/commenti?postId=4

router.get("/", async (req, res) => {
    try {
        const { postId } = req.query;
        const risultato = await trovaCommenti(postId ? parseInt(postId) : undefined);
        res.json(risultato);
    } catch (errore) {
        console.error("Errore GET /api/commenti:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

// ============================================================
// GET /api/commenti/:id — Singolo commento
// ============================================================

router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const commento = await trovaCommentoPerId(id);

        if (!commento) {
            return res.status(404).json({
                errore: `Commento con id ${id} non trovato`
            });
        }

        res.json(commento);
    } catch (errore) {
        console.error("Errore GET /api/commenti/:id:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

// ============================================================
// POST /api/commenti — Crea un nuovo commento
// ============================================================
// Campi obbligatori nel body: "postId", "nome", "email", "corpo"

router.post("/", async (req, res) => {
    try {
        const { postId, nome, email, corpo } = req.body;

        if (!postId || !nome || !email || !corpo) {
            return res.status(400).json({
                errore: "I campi 'postId', 'nome', 'email' e 'corpo' sono obbligatori"
            });
        }

        const nuovoCommento = await creaCommento({ postId, nome, email, corpo });
        res.status(201).json(nuovoCommento);
    } catch (errore) {
        console.error("Errore POST /api/commenti:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

// ============================================================
// PUT /api/commenti/:id — Sostituisce un commento
// ============================================================
// Campi obbligatori nel body: "postId", "nome", "email", "corpo"

router.put("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { postId, nome, email, corpo } = req.body;

        if (!postId || !nome || !email || !corpo) {
            return res.status(400).json({
                errore: "I campi 'postId', 'nome', 'email' e 'corpo' sono obbligatori"
            });
        }

        const aggiornato = await sostituisciCommento(id, { postId, nome, email, corpo });

        if (!aggiornato) {
            return res.status(404).json({
                errore: `Commento con id ${id} non trovato`
            });
        }

        res.json(aggiornato);
    } catch (errore) {
        console.error("Errore PUT /api/commenti/:id:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

// ============================================================
// PATCH /api/commenti/:id — Aggiorna parzialmente
// ============================================================

router.patch("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { postId, nome, email, corpo } = req.body;

        const commento = await aggiornaCommento(id, { postId, nome, email, corpo });

        if (!commento) {
            return res.status(404).json({
                errore: `Commento con id ${id} non trovato`
            });
        }

        res.json(commento);
    } catch (errore) {
        console.error("Errore PATCH /api/commenti/:id:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

// ============================================================
// DELETE /api/commenti/:id — Elimina un commento
// ============================================================

router.delete("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const rimosso = await eliminaCommento(id);

        if (!rimosso) {
            return res.status(404).json({
                errore: `Commento con id ${id} non trovato`
            });
        }

        res.json({ messaggio: "Commento eliminato", commento: rimosso });
    } catch (errore) {
        console.error("Errore DELETE /api/commenti/:id:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

export default router;
