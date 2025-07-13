const pool = require('../config/db');
const { validationResult } = require('express-validator');
// Criar uma nova tarefa
exports.createTask = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, status } = req.body;
    const userId = req.userId; // Obtido do middleware de autenticação

    // Validação básica
    if (!title){
        res.status(400).json({message: 'O titulo é obrigatório'})
    };

    try {
        // Inserir a nova tarefa no banco de dados
        const newTask =await pool.query(
            'INSERT INTO tasks (title, description, status, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, description, status, userId]
        );  
        res.status(201).json({
            message: 'Tarefa criada com sucesso!',
            task: newTask.rows[0]
        });

    } catch (error) {
        console.error('Erro ao criar tarefa:', error.message);
        res.status(500).json({ message: 'Erro interno do servidor ao criar tarefa.', error: error.message });
    }
};

// obter todas as tarefas de um usuário com filtragem e pesquisa
exports.getTasks = async (req, res) => {
    const userId = req.userId;
    const { status, search, page = 10, limit = 10} = req.query;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt (limit, 10);

    //calcular offset

    const offset = (parsedPage - 1) * parsedLimit

    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const queryParams = [userId];
    let paramIndex = 2; // começa em 2 porque $1 já é userId

    // Adiciona filtro por status
    if (status) {
        query += ` AND status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
    }

    // Adiciona pesquisa por titulo ou descricao
    if (search) {
        query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex + 1})`;
        queryParams.push(`%${search}%`);
        queryParams.push(`%${search}%`);
        paramIndex += 2;
    }

    // Adiciona ordenação
    query += ' ORDER BY created_at DESC';

    // Adicionar limit e offset para paginação
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    queryParams.push(parsedLimit, offset);

    console.log('Query SQL para getTasks (com paginação):', query);
    console.log('Parâmetros da query (com paginação):', queryParams);

    try {
        const result = await pool.query(query, queryParams);

        let totalTasksQuery = 'SELECT COUNT(*) FROM tasks WHERE user_id = $1';
        const totalTasksParams = [userId];
        let totalParamIndex = 2;

        if (status) {
            totalTasksQuery += ` AND status = $${totalParamIndex++}`;
            totalTasksParams.push(status);
        }
        if (search) {
            totalTasksQuery += ` AND (title ILIKE $${totalParamIndex} OR description ILIKE $${totalParamIndex + 1})`;
            totalTasksParams.push(`%${search}%`);
            totalTasksParams.push(`%${search}%`);
            totalParamIndex += 2;
        }

        const totalResult = await pool.query(totalTasksQuery, totalTasksParams);
        const totalTasks = parseInt(totalResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalTasks / parsedLimit);

        res.status(200).json({
            message: 'Tarefas obtidas com sucesso!',
            tasks: result.rows,
            pagination: {
                totalTasks,
                totalPages,
                currentPage: parsedPage,
                limit: parsedLimit
            }
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

        res.status(200).json({
            message: 'Tarefa obtida com sucesso!',
            task: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao obter tarefa por ID:', error.message);
        res.status(500).json({ message: 'Erro interno do servidor ao obter tarefa.', error: error.message });
    }
};

//Atualiza uma tarefa
exports.updateTask = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, status } = req.body;
    const userId = req.userId;

    //Validação básica
    if (!title && !description && !status){
        return res.status(400).json({message: 'Todos os campos devem ser fornecidos para atualização'})
    };
    
    try {
        //Atualizar a tarefa no banco de dados
        const fieldsToUpdate = [];
        const updateParams = [];
        let paramIndex = 1;

        if (title !== undefined) {
            fieldsToUpdate.push(`title = $${paramIndex++}`);
            updateParams.push(title);
        }
        if (description !== undefined) {
            fieldsToUpdate.push(`description = $${paramIndex++}`);
            updateParams.push(description);
        }
        if (status !== undefined) {
            fieldsToUpdate.push(`status = $${paramIndex++}`);
            updateParams.push(status);
        }

        // Se nenhum campo foi fornecido para atualização
        if (fieldsToUpdate.length === 0) {
            return res.status(400).json({ message: 'Nenhum campo fornecido para atualização.' });
        }

        fieldsToUpdate.push(`updated_at = CURRENT_TIMESTAMP`);

        const query = `UPDATE tasks SET ${fieldsToUpdate.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex} RETURNING *`;
        updateParams.push(id, userId);

        const updatedTask = await pool.query(query, updateParams);

        if (updatedTask.rows.length === 0) {
            return res.status(404).json({ message: 'Tarefa não encontrada ou você não tem permissão para atualizá-la.' });
        }

        res.status(200).json({
            message: 'Tarefa atualizada com sucesso!',
            task: updatedTask.rows[0]
        });

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
