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

// Obter todas as tarefas de um usuário com filtragem e pesquisa
exports.getTasks = async (req, res) => {
    const userId = req.userId;
    const { status, search } = req.query;

    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const queryParams = [userId];
    let paramIndex = 2; // começa em 2 porque $1 já é userId

    // Adiciona filtro por status
    if (status) {
        query += ` AND status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
    }

    // Adiciona pesquisa por título ou descrição, se fornecido
    if (search) {
        query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex + 1})`;
        queryParams.push(`%${search}%`);
        queryParams.push(`%${search}%`);
        paramIndex += 2;
    }

    // Adiciona ordenação
    query += ' ORDER BY created_at DESC';

    try {
        const result = await pool.query(query, queryParams);

        // Se filtrou por status e não encontrou nenhuma tarefa
        if (status && result.rows.length === 0) {
            return res.status(404).json({message: `Não há nenhuma tarefa com o status "${status}"`});
        }

        if (search && result.rows.length===0){
            return res.status(404).json({message: 'Nenhuma tarefa encontrada com a pesquisa fornecida'});
        } 


        res.status(200).json({
        message: 'Tarefas obtidas com sucesso!',
        tasks: result.rows
         });
    

        
    } catch (error) {
        console.error('Erro ao obter tarefas com filtro/pesquisa:', error.message);
        res.status(500).json({ message: 'Erro interno do servidor ao obter tarefas.', error: error.message });
    }
};

//única tarefa por ID
exports.getTaskById = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        //Seleciona a tarefa pelo ID E pelo user_id para garantir que pertence ao usuário logado
        const result = await pool.query(
            'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tarefa não encontrada ou não pertence ao usuário' });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Erro ao obter tarefa por ID:', error.message);
        res.status(500).json({ message: 'Erro interno do servidor ao obter tarefa.', error: error.message });
    }
};

//Atualiza uma tarefa
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

        
        if (result.rowCount === 0){
            return res.status(400).json({message: 'Tarefa não encontrada'});
        };

     
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
        // Deleta a tarefa no banco de dados
        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Tarefa não encontrada' });
        }

        res.status(200).json({ message: 'Tarefa deletada com sucesso' });

    } catch (error) {
        console.error('Erro ao deletar tarefa:', error.message);
        res.status(500).json({ message: 'Erro interno do servidor ao deletar tarefa.', error: error.message });
    }
};
