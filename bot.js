const TelegramBot = require('node-telegram-bot-api');
const connection = require('./db'); // Importiamo connessione al database

// Rimpiazziamo con il token del nostro bot
const token = '7667874043:AAEQ_yESCrXV9sIL-Q9rN5fFqfR7u2ObLG0';
const bot = new TelegramBot(token, { polling: true });

// Start message
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Benvenuto! Puoi usare i comandi /getdata o /adddata.');
});

// Comando per ottenere i dati dal database
bot.onText(/\/getdata/, (msg) => {
    connection.query('SELECT * FROM veicoli', (err, results) => {
        if (err) {
            bot.sendMessage(msg.chat.id, 'Errore durante il recupero dei dati.');
            console.error(err);
            return;
        }

        if (results.length === 0) {
            bot.sendMessage(msg.chat.id, 'Nessun dato trovato.');
        } else {
            const data = results
                .map((row) => `${row.targa} - ${row.modello} (Proprietario: ${row.proprietario})`)
                .join('\n');
            bot.sendMessage(msg.chat.id, `Dati Veicoli:\n${data}`);
        }
    });
});

// Comando per aggiungere dati al database
bot.onText(/\/adddata (.+)/, (msg, match) => {
    const input = match[1]; // Otteniamo l'input dell'utente dopo /adddata
    const [targa, modello, proprietario] = input.split(',');

    if (!targa || !modello || !proprietario) {
        bot.sendMessage(
            msg.chat.id,
            'Formato non valido! Usa: /adddata <targa>,<modello>,<proprietario>'
        );
        return;
    }

    connection.query(
        'INSERT INTO veicoli (targa, modello, proprietario) VALUES (?, ?, ?)',
        [targa.trim(), modello.trim(), proprietario.trim()],
        (err, results) => {
            if (err) {
                bot.sendMessage(msg.chat.id, 'Errore durante l\'aggiunta dei dati.');
                console.error(err);
                return;
            }
            bot.sendMessage(msg.chat.id, 'Dati aggiunti con successo!');
        }
    );
});
