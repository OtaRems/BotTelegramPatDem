const tesseract = require('tesseract.js');

//Funzione per riconoscere il testo nelle foto (OCR)
const processLicensePlate = async (filePath) => {
    try {
        const { data: { text } } = await tesseract.recognize(filePath);

        // Rimuove spazi extra e simboli inutili
        const licensePlate = text.replace(/[^A-Z0-9]/g, '').toUpperCase();

        console.log(`Targa rilevata: ${licensePlate}`);
        return licensePlate;
    } catch (err) {
        console.error('Errore durante l\'OCR:', err);
        return null;
    }
};

//Esporta la funzione
module.exports = processLicensePlate;
