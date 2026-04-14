// routes/post.js — Route per la risorsa Post
//
// Endpoint completo: /api/post (il prefisso è montato in server.js)
//
// Versione aggiornata: usa MySQL invece degli array in memoria.

import { Router } from "express";
import {
    trovaPost, trovaPostPerId, creaPost,
    sostituisciPost, aggiornaPost, eliminaPost
} from "../database/queries/post.js";

const router = Router();

// ============================================================
// GET /api/post — Lista tutti i post
// ============================================================
// Filtro opzionale: /api/post?userId=2
//
// Prima (array):    post.filter(p => p.userId === parseInt(userId))
// Adesso (MySQL):   SELECT * FROM post WHERE userId = ?

router.get("/", async (req, res) => {
    try {
        const { userId } = req.query;
        const risultato = await trovaPost(userId ? parseInt(userId) : undefined);
        res.json(risultato);
    } catch (errore) {
        console.error("Errore GET /api/post:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

// ============================================================
// GET /api/post/:id — Singolo post
// ============================================================

router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const elemento = await trovaPostPerId(id);

        if (!elemento) {
            return res.status(404).json({
                errore: `Post con id ${id} non trovato`
            });
        }

        res.json(elemento);
    } catch (errore) {
        console.error("Errore GET /api/post/:id:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

// ============================================================
// POST /api/post — Crea un nuovo post
// ============================================================
// Campi obbligatori nel body: "userId", "titolo", "corpo"

router.post("/", async (req, res) => {
    try {
        const { userId, titolo, corpo } = req.body;

        if (!userId || !titolo || !corpo) {
            return res.status(400).json({
                errore: "I campi 'userId', 'titolo' e 'corpo' sono obbligatori"
            });
        }

        const nuovoPost = await creaPost({ userId, titolo, corpo });
        res.status(201).json(nuovoPost);
    } catch (errore) {
        console.error("Errore POST /api/post:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

// ============================================================
// PUT /api/post/:id — Sostituisce un post
// ============================================================
// Campi obbligatori nel body: "userId", "titolo", "corpo"

router.put("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { userId, titolo, corpo } = req.body;

        if (!userId || !titolo || !corpo) {
            return res.status(400).json({
                errore: "I campi 'userId', 'titolo' e 'corpo' sono obbligatori"
            });
        }

        const aggiornato = await sostituisciPost(id, { userId, titolo, corpo });

        if (!aggiornato) {
            return res.status(404).json({
                errore: `Post con id ${id} non trovato`
            });
        }

        res.json(aggiornato);
    } catch (errore) {
        console.error("Errore PUT /api/post/:id:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

// ============================================================
// PATCH /api/post/:id — Aggiorna parzialmente
// ============================================================

router.patch("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { userId, titolo, corpo } = req.body;

        const elemento = await aggiornaPost(id, { userId, titolo, corpo });

        if (!elemento) {
            return res.status(404).json({
                errore: `Post con id ${id} non trovato`
            });
        }

        res.json(elemento);
    } catch (errore) {
        console.error("Errore PATCH /api/post/:id:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

// ============================================================
// DELETE /api/post/:id — Elimina un post
// ============================================================
// Nota: grazie a ON DELETE CASCADE, eliminando un post
// vengono eliminati automaticamente anche i suoi commenti.

router.delete("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const rimosso = await eliminaPost(id);

        if (!rimosso) {
            return res.status(404).json({
                errore: `Post con id ${id} non trovato`
            });
        }

        res.json({ messaggio: "Post eliminato", post: rimosso });
    } catch (errore) {
        console.error("Errore DELETE /api/post/:id:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

export default router;
