// ARCHIVIO — Questo file era il vecchio "database" in memoria.
// Lo teniamo come riferimento per confrontare l'approccio con array
// rispetto all'approccio con MySQL.
// Non viene più importato da nessuna route.
//
// === Versione originale ===
//
// Contiene i dati iniziali e le funzioni helper per gestirli.
// Le route importano quello che serve da qui.

// ============================================================
// DATI
// ============================================================

export const utenti = [
    { id: 1, nome: "Mario Rossi", email: "mario@email.com", citta: "Roma" },
    { id: 2, nome: "Luigi Verdi", email: "luigi@email.com", citta: "Milano" },
    { id: 3, nome: "Peach Bianchi", email: "peach@email.com", citta: "Napoli" },
    { id: 4, nome: "Toad Gialli", email: "toad@email.com", citta: "Torino" },
    { id: 5, nome: "Bowser Neri", email: "bowser@email.com", citta: "Firenze" }
];

export const post = [
    { id: 1, userId: 1, titolo: "Il mio primo post", corpo: "Ciao a tutti! Questo è il mio primo post sulla piattaforma." },
    { id: 2, userId: 1, titolo: "Node.js è fantastico", corpo: "Oggi ho imparato a creare un server con Express.js." },
    { id: 3, userId: 2, titolo: "Ricetta pasta e fagioli", corpo: "Ingredienti: pasta, fagioli, olio, aglio, peperoncino..." },
    { id: 4, userId: 3, titolo: "Viaggio a Parigi", corpo: "La Tour Eiffel è ancora più bella dal vivo di quanto immaginassi." },
    { id: 5, userId: 3, titolo: "Consigli per lo studio", corpo: "Ecco i miei 5 consigli per studiare programmazione in modo efficace." },
    { id: 6, userId: 4, titolo: "Recensione: The Last of Us", corpo: "Un capolavoro videoludico che emoziona dall'inizio alla fine." },
    { id: 7, userId: 5, titolo: "Il futuro dell'AI", corpo: "L'intelligenza artificiale sta cambiando il modo in cui lavoriamo." },
    { id: 8, userId: 2, titolo: "La mia città preferita", corpo: "Milano non è solo moda e business, ha anche una grande anima culturale." }
];

export const commenti = [
    { id: 1, postId: 1, nome: "Luigi Verdi", email: "luigi@email.com", corpo: "Benvenuto nella piattaforma!" },
    { id: 2, postId: 1, nome: "Peach Bianchi", email: "peach@email.com", corpo: "Bel primo post, complimenti!" },
    { id: 3, postId: 2, nome: "Toad Gialli", email: "toad@email.com", corpo: "Anche io sto imparando Node.js, è davvero potente." },
    { id: 4, postId: 3, nome: "Mario Rossi", email: "mario@email.com", corpo: "Ottima ricetta! La provo stasera." },
    { id: 5, postId: 4, nome: "Bowser Neri", email: "bowser@email.com", corpo: "Parigi è nella mia bucket list, grazie per il racconto!" },
    { id: 6, postId: 4, nome: "Luigi Verdi", email: "luigi@email.com", corpo: "Ci sono stato l'anno scorso, confermo tutto!" },
    { id: 7, postId: 5, nome: "Toad Gialli", email: "toad@email.com", corpo: "Il consiglio sulla pratica quotidiana è il più importante." },
    { id: 8, postId: 7, nome: "Mario Rossi", email: "mario@email.com", corpo: "L'AI è un tema affascinante ma anche un po' spaventoso." },
    { id: 9, postId: 7, nome: "Peach Bianchi", email: "peach@email.com", corpo: "Sono d'accordo, l'importante è usarla in modo etico." },
    { id: 10, postId: 6, nome: "Luigi Verdi", email: "luigi@email.com", corpo: "Capolavoro assoluto, lo sto rigiocando per la terza volta." }
];

// ============================================================
// CONTATORI ID
// Servono per generare nuovi ID univoci quando create nuove risorse.
// Partono dal numero successivo all'ultimo ID presente nei dati.
// ============================================================

export const contatori = {
    utenti: 6,
    post: 9,
    commenti: 11
};

// ============================================================
// FUNZIONI HELPER
// Usate queste funzioni nelle route per trovare, creare, ecc.
// ============================================================

/**
 * Genera il prossimo ID per una risorsa e incrementa il contatore.
 * @param {"utenti" | "post" | "commenti"} risorsa
 * @returns {number} Il nuovo ID
 *
 * Esempio:
 *   const id = prossimoId("utenti"); // → 6 (la prima volta)
 *   const id2 = prossimoId("utenti"); // → 7 (la seconda volta)
 */
export function prossimoId(risorsa) {
    return contatori[risorsa]++;
}

/**
 * Cerca un elemento per ID in un array.
 * @param {Array} array - L'array in cui cercare (es. utenti, post, commenti)
 * @param {number} id - L'ID da cercare
 * @returns {Object|undefined} L'elemento trovato, o undefined se non esiste
 *
 * Esempio:
 *   const utente = trovaPerId(utenti, 3); // → { id: 3, nome: "Peach Bianchi", ... }
 *   const nope = trovaPerId(utenti, 99);  // → undefined
 */
export function trovaPerId(array, id) {
    return array.find(item => item.id === id);
}

/**
 * Cerca l'indice di un elemento per ID in un array.
 * @param {Array} array - L'array in cui cercare
 * @param {number} id - L'ID da cercare
 * @returns {number} L'indice dell'elemento, o -1 se non esiste
 *
 * Esempio:
 *   const idx = trovaIndicePerId(utenti, 3); // → 2
 *   const nope = trovaIndicePerId(utenti, 99); // → -1
 */
export function trovaIndicePerId(array, id) {
    return array.findIndex(item => item.id === id);
}
