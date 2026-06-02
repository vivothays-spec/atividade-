const mysql = require('mysql2');

// Configuração do MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // sua senha
    database: 'suporte_db'  // <--- MUDAR AQUI
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar:', err);
        return;
    }
    console.log('Conectado ao MySQL Workbench! Banco: suporte_db');
});

module.exports = connection;