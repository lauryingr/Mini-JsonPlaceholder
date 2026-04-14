// js/api.js — Modulo per le chiamate API
//
// Tutte le funzioni fetch sono qui. Nessun codice DOM.
// Importa queste funzioni da app.js per ottenere/creare/eliminare dati.

const BASE_URL = "http://localhost:3000/api";

// ============================================================
// Helper privato — wrappa fetch con JSON e gestione errori
// ============================================================

async function chiamataApi(percorso, opzioni = {}) {
    const risposta = await fetch(`${BASE_URL}${percorso}`, {
        headers: { "Content-Type": "application/json" },
        ...opzioni,
    });

    const dati = await risposta.json();

    if (!risposta.ok) {
        throw new Error(dati.errore || "Errore sconosciuto");
    }

    return dati;
}

// ============================================================
// Utenti
// ============================================================

export async function ottieniUtenti() {
    return chiamataApi("/utenti");
}

export async function creaUtente(dati) {
    return chiamataApi("/utenti", {
        method: "POST",
        body: JSON.stringify(dati),
    });
}

export async function eliminaUtente(id) {
    return chiamataApi(`/utenti/${id}`, { method: "DELETE" });
}

// ============================================================
// Post
// ============================================================

export async function ottieniPost(userId) {
    const query = userId ? `?userId=${userId}` : "";
    return chiamataApi(`/post${query}`);
}

export async function creaPost(dati) {
    return chiamataApi("/post", {
        method: "POST",
        body: JSON.stringify(dati),
    });
}

export async function eliminaPost(id) {
    return chiamataApi(`/post/${id}`, { method: "DELETE" });
}

// ============================================================
// Commenti
// ============================================================

export async function ottieniCommenti(postId) {
    const query = postId ? `?postId=${postId}` : "";
    return chiamataApi(`/commenti${query}`);
}

export async function creaCommento(dati) {
    return chiamataApi("/commenti", {
        method: "POST",
        body: JSON.stringify(dati),
    });
}

export async function eliminaCommento(id) {
    return chiamataApi(`/commenti/${id}`, { method: "DELETE" });
}
