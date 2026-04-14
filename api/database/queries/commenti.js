// database/queries/commenti.js — Query SQL per la risorsa Commenti
//
// Stessa struttura di queries/utenti.js — ogni funzione esegue una query SQL.

import pool from "../connessione.js";

// ============================================================
// SELECT — Lettura
// ============================================================

/**
 * Restituisce tutti i commenti. Se viene passato un postId, filtra per quello.
 *
 * SQL senza filtro:  SELECT * FROM commenti
 * SQL con filtro:    SELECT * FROM commenti WHERE postId = ?
 */
export async function trovaCommenti(postId) {
    if (postId) {
        const [righe] = await pool.query(
            "SELECT * FROM commenti WHERE postId = ?",
            [postId]
        );
        return righe;
    }

    const [righe] = await pool.query("SELECT * FROM commenti");
    return righe;
}

/**
 * Cerca un singolo commento per ID.
 *
 * SQL: SELECT * FROM commenti WHERE id = ?
 */
export async function trovaCommentoPerId(id) {
    const [righe] = await pool.query(
        "SELECT * FROM commenti WHERE id = ?",
        [id]
    );
    return righe[0];
}

// ============================================================
// INSERT — Creazione
// ============================================================

/**
 * Crea un nuovo commento nel database.
 *
 * SQL: INSERT INTO commenti (postId, nome, email, corpo) VALUES (?, ?, ?, ?)
 */
export async function creaCommento({ postId, nome, email, corpo }) {
    const [risultato] = await pool.query(
        "INSERT INTO commenti (postId, nome, email, corpo) VALUES (?, ?, ?, ?)",
        [postId, nome, email, corpo]
    );

    return { id: risultato.insertId, postId, nome, email, corpo };
}

// ============================================================
// UPDATE — Modifica
// ============================================================

/**
 * Sostituisce completamente un commento (PUT).
 *
 * SQL: UPDATE commenti SET postId = ?, nome = ?, email = ?, corpo = ? WHERE id = ?
 */
export async function sostituisciCommento(id, { postId, nome, email, corpo }) {
    const [risultato] = await pool.query(
        "UPDATE commenti SET postId = ?, nome = ?, email = ?, corpo = ? WHERE id = ?",
        [postId, nome, email, corpo, id]
    );

    if (risultato.affectedRows === 0) return null;
    return { id, postId, nome, email, corpo };
}

/**
 * Aggiorna parzialmente un commento (PATCH).
 *
 * SQL dinamico: UPDATE commenti SET <campo> = ?, ... WHERE id = ?
 */
export async function aggiornaCommento(id, dati) {
    const campiPermessi = ["postId", "nome", "email", "corpo"];
    const aggiornamenti = [];
    const valori = [];

    for (const campo of campiPermessi) {
        if (dati[campo] !== undefined) {
            aggiornamenti.push(`${campo} = ?`);
            valori.push(dati[campo]);
        }
    }

    if (aggiornamenti.length > 0) {
        valori.push(id);
        await pool.query(
            `UPDATE commenti SET ${aggiornamenti.join(", ")} WHERE id = ?`,
            valori
        );
    }

    return trovaCommentoPerId(id);
}

// ============================================================
// DELETE — Eliminazione
// ============================================================

/**
 * Elimina un commento per ID.
 *
 * SQL: DELETE FROM commenti WHERE id = ?
 */
export async function eliminaCommento(id) {
    const commento = await trovaCommentoPerId(id);
    if (!commento) return null;

    await pool.query("DELETE FROM commenti WHERE id = ?", [id]);
    return commento;
}
