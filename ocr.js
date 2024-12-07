const tesseract = require('tesseract.js');

// Funzione per riconoscere il testo nelle foto (OCR)
const processLicensePlate = async (filePath) => {
    try {
        // Usa Tesseract.js per estrarre il testo dall'immagine
        const { data: { text } } = await tesseract.recognize(filePath);

        // Rimuove spazi extra e simboli inutili
        const licensePlate = text.replace(/[\s-]+/g, '').toUpperCase();

        console.log(`Targa rilevata: ${licensePlate}`);
        return licensePlate;
    } catch (err) {
        console.error('Errore durante l\'OCR:', err);
        return null;
    }
};

// Esporta la funzione
module.exports = processLicensePlate;
