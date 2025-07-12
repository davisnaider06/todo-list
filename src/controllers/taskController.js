const pool = require('../config/db');

// Criar uma nova tarefa
exports.createTask = async (req, res) => {
    const { title, description, status } = req.body;
    const userId = req.userId; // Obtido do middleware de autenticação

    // Validação básica
    if (!title){
        res.status(400).json({message: 'O titulo é obrigatório'})
    };

    try {
        // Inserir a nova tarefa no banco de dados
        await pool.query(
            'INSERT INTO tasks (title, description, status, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, description, status, userId]
        );  
        res.status(201).json({message: 'Tarefa criada com sucesso'})

    } catch (error) {
        console.error('Erro ao criar tarefa:', error.message);
        res.status(500).json({ message: 'Erro interno do servidor ao criar tarefa.', error: error.message });
    }
};

//Obter todas as tarefas de um usuário
exports.getTasks = async (req, res) => {
    const userId = req.userId; // Obtido do middleware de autenticação

    try {
        // Selecionar todas as tarefas do usuário logado
        const result = await pool.query(
            'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Erro ao obter tarefas:', error.message);
        res.status(500).json({ message: 'Erro interno do servidor ao obter tarefas.', error: error.message });
    }
};

// Obter uma única tarefa por ID
exports.getTaskById = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        // Selecionar a tarefa pelo ID E pelo user_id para garantir que pertence ao usuário logado
        const result = await pool.query(
            'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        // Verificar se a tarefa existe e pertence ao usuário
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tarefa não encontrada ou não pertence ao usuário' });
        }

        // Retorna a tarefa
        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Erro ao obter tarefa por ID:', error.message);
        res.status(500).json({ message: 'Erro interno do servidor ao obter tarefa.', error: error.message });
    }
};

// Atualizar uma tarefa
exports.updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const userId = req.userId;

    //Validação básica
    if (!title && !description && !status){
        return res.status(400).json({message: 'Todos os campos devem ser fornecidos para atualização'})
    };
    
    try {
        //Atualizar a tarefa no banco de dados
        const result = await pool.query(
            'UPDATE tasks SET title = $1, description = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND user_id = $5 RETURNING *',
            [title, description, status, id, userId]
        )

        //Verificar se a tarefa foi atualizada e pertence ao usuário
        if (result.rowCount === 0){
            return res.status(400).json({message: 'Tarefa não encontrada'});
        };

        //Retorna a tarefa atualizada
        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Erro ao atualizar tarefa:', error.message);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar tarefa.', error: error.message });
    }
};

// Deletar uma tarefa
exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        // Deletar a tarefa no banco de dados
        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Tarefa não encontrada' });
        }

        // Retornar uma mensagem de sucesso
        res.status(200).json({ message: 'Tarefa deletada com sucesso' });

    } catch (error) {
        console.error('Erro ao deletar tarefa:', error.message);
        res.status(500).json({ message: 'Erro interno do servidor ao deletar tarefa.', error: error.message });
    }
};
