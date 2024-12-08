const mysql = require('mysql2');

//Configurazione Database
const connection = mysql.createConnection({
    host: 'localhost',         
    user: 'root',              
    password: '',              
    database: 'auto',    
});

//Connetti al Database
connection.connect((err) => {
    if (err) {
        console.error('Errore di connessione al database:', err);
    } else {
        console.log('Connesso al database');
    }
});

module.exports = connection;
