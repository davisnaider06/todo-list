const { Pool } = require('pg');
require('dotenv').config(); //carregando as variaveis de ambiente

// Configurações do Pool do PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Testando a conexão
pool.connect()
    .then(client => {
        console.log('Conectado ao PostgreSQL com sucesso através de src/config/db.js!');
        client.release(); //Libera o cliente de volta para o pool
    })
    .catch(err => {
        console.error('Erro ao conectar ao PostgreSQL em src/config/db.js:', err.message);
        // caso queira encerrar aq
        // process.exit(1);
    });

module.exports = pool;