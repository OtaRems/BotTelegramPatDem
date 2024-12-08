const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const connection = require('./db'); //Importiamo connessione al database
const processLicensePlate = require('./ocr'); //Importa la funzione OCR

//Rimpiazziamo con il token del nostro bot
const token = '7667874043:AAEQ_yESCrXV9sIL-Q9rN5fFqfR7u2ObLG0';
const bot = new TelegramBot(token, { polling: true });
console.log("Bot attivo");

//Messaggio di start
bot.onText(/\/start/, (msg) => {
    bot.sendPhoto(msg.chat.id, "downloads/ex.jpg", {caption: `Benvenuto ${msg.from.first_name}! puoi fotografare una targa, facendo attenzione a mostrare solamente il testo necessario per il riconoscimento e conoscere il proprietario dell\'auto.\n\n/getdata per visualizzare tutte le targhe.\n/adddata (targa),(modello),(proprietario) per aggiungere un nuovo veicolo.`} );
});

//attendi l'arrivo delle foto
bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;

    const photoId = msg.photo[msg.photo.length - 1].file_id;

    //Scarica l'immagine dal server di Telegram
    const filePath = `./downloads/${photoId}.jpg`;
    const fileLink = await bot.getFileLink(photoId);

    //Scarica l'immagine e salva localmente
    const response = await fetch(fileLink);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    //Esegui l'OCR sull'immagine
    const licensePlate = await processLicensePlate(filePath);

    if (!licensePlate) {
        bot.sendMessage(chatId, 'Errore durante l\'elaborazione dell\'immagine. Riprova.');
        return;
    }

    //Cerca la targa nel database
    connection.query(
        'SELECT * FROM veicoli WHERE targa = ?',
        [licensePlate],
        (err, results) => {
            if (err) {
                bot.sendMessage(chatId, 'Errore durante la ricerca nel database.');
                console.error(err);
                return;
            }

            if (results.length === 0) {
                bot.sendMessage(chatId, `Nessun veicolo trovato per la targa: ${licensePlate}`);
            } else {
                const vehicle = results[0];
                const responseMessage = `Veicolo trovato:\nTarga: ${vehicle.targa}\nModello: ${vehicle.modello}\nProprietario: ${vehicle.proprietario}`;
                bot.sendMessage(chatId, responseMessage);
            }
        }
    );

    //Elimina l'immagine locale per risparmiare spazio
    fs.unlinkSync(filePath);
});

//Comando per ottenere i dati dal database
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
            const data = results.map((row) => `${row.targa} - ${row.modello} (Proprietario: ${row.proprietario})`).join('\n');
            bot.sendMessage(msg.chat.id, `Dati Veicoli:\n${data}`);
        }
    });
});

//Comando per aggiungere dati al database
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
