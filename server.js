const express = require('express');
const pool = require('./src/config/db');
require('dotenv').config();
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes')
const taskRoutes = require('./src/routes/taskRoutes')
const { errorHandler } = require('./src/middlewares/errorMiddleware');
const app = express();
const port = process.env.port || 3000;

app.use(express.json());


app.get('/', (req, res) => {
    res.send('API de Gerenciamento de Tarefas está online!');
});

// define uma rota para testar a conexão com o banco de dados
app.get('/test-db', async (req, res) => {
    try {
        // Executa uma consulta simples para verificar a conexão
        const result = await pool.query('SELECT NOW()');
        res.status(200).json({
            message: 'Conexão com o banco de dados PostgreSQL bem-sucedida!',
            currentTime: result.rows[0].now
        });
    } catch (error) {
        console.error('Erro ao testar a conexão com o DB:', error.message);
        res.status(500).json({
            message: 'Erro ao conectar ao banco de dados PostgreSQL.',
            error: error.message
        });
    }
});

app.use(cors());

//Usar as rotas de autenticação
// Todas as rotas definidas em authRoutes.js vao ser prefixadas com /api/auth
app.use('/api/auth', authRoutes);

//Usar as rotas de tarefas
//Todas as rotas definidas em taskRoutes.js serão prefixadas com /api/tasks
app.use('/api/tasks', taskRoutes);

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
