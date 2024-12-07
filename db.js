const mysql = require('mysql2');

// Database configuration
const connection = mysql.createConnection({
    host: 'localhost',         
    user: 'root',              
    password: '',              
    database: 'auto',    
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Errore di connessione al database:', err);
    } else {
        console.log('Connesso al database');
    }
});

module.exports = connection;
