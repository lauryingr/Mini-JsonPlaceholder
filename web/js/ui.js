// js/ui.js — Funzioni di rendering DOM
//
// Ogni funzione riceve dati + contenitore + callbacks.
// Nessuna chiamata API qui — solo costruzione HTML.

// ============================================================
// Helper
// ============================================================

export function pulisciContenitore(contenitore) {
    contenitore.innerHTML = "";
}

export function mostraErrore(messaggio, contenitore) {
    const div = document.createElement("div");
    div.className = "errore";
    div.textContent = messaggio;
    contenitore.prepend(div);

    // Rimuovi dopo 4 secondi
    setTimeout(() => div.remove(), 4000);
}

function mostraVuoto(contenitore, testo) {
    contenitore.innerHTML = `<p class="vuoto">${testo}</p>`;
}

// ============================================================
// Utenti
// ============================================================

/**
 * @param {Array} utenti
 * @param {HTMLElement} contenitore
 * @param {{ onVediPost: Function, onElimina: Function }} callbacks
 */
export function mostraUtenti(utenti, contenitore, callbacks) {
    pulisciContenitore(contenitore);

    if (utenti.length === 0) {
        mostraVuoto(contenitore, "Nessun utente trovato");
        return;
    }

    utenti.forEach(utente => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <h3>${utente.nome}</h3>
            <p>${utente.email}</p>
            <p>${utente.citta || "Nessuna citta"}</p>
            <div class="azioni">
                <button class="btn-primario" data-azione="vedi-post">Vedi Post</button>
                <button class="btn-pericolo" data-azione="elimina">Elimina</button>
            </div>
        `;

        card.querySelector('[data-azione="vedi-post"]').addEventListener("click", () => {
            callbacks.onVediPost(utente);
        });

        card.querySelector('[data-azione="elimina"]').addEventListener("click", () => {
            callbacks.onElimina(utente.id);
        });

        contenitore.appendChild(card);
    });
}

// ============================================================
// Post
// ============================================================

/**
 * @param {Array} post
 * @param {HTMLElement} contenitore
 * @param {{ onVediCommenti: Function, onElimina: Function }} callbacks
 */
export function mostraPost(post, contenitore, callbacks) {
    pulisciContenitore(contenitore);

    if (post.length === 0) {
        mostraVuoto(contenitore, "Nessun post trovato");
        return;
    }

    post.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <h3>${p.titolo}</h3>
            <p>${p.corpo}</p>
            <div class="azioni">
                <button class="btn-primario" data-azione="vedi-commenti">Vedi Commenti</button>
                <button class="btn-pericolo" data-azione="elimina">Elimina</button>
            </div>
        `;

        card.querySelector('[data-azione="vedi-commenti"]').addEventListener("click", () => {
            callbacks.onVediCommenti(p);
        });

        card.querySelector('[data-azione="elimina"]').addEventListener("click", () => {
            callbacks.onElimina(p.id);
        });

        contenitore.appendChild(card);
    });
}

// ============================================================
// Commenti
// ============================================================

/**
 * @param {Array} commenti
 * @param {HTMLElement} contenitore
 * @param {{ onElimina: Function }} callbacks
 */
export function mostraCommenti(commenti, contenitore, callbacks) {
    pulisciContenitore(contenitore);

    if (commenti.length === 0) {
        mostraVuoto(contenitore, "Nessun commento trovato");
        return;
    }

    commenti.forEach(c => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <h3>${c.nome}</h3>
            <p>${c.email}</p>
            <p>${c.corpo}</p>
            <div class="azioni">
                <button class="btn-pericolo" data-azione="elimina">Elimina</button>
            </div>
        `;

        card.querySelector('[data-azione="elimina"]').addEventListener("click", () => {
            callbacks.onElimina(c.id);
        });

        contenitore.appendChild(card);
    });
}
