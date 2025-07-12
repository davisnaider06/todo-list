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
    const userId = req.userId; // Obtido do middleware de autenticação
    const { status, search } = req.query; // Obtém os parâmetros de consulta (query parameters)

    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const queryParams = [userId];
    let paramIndex = 2; // Começa em 2 porque $1 já é userId

    // Adicionar filtro por status, se fornecido
    if (status) {
        // Dica: Adicione uma cláusula WHERE para status.
        // Exemplo: query += ' AND status = $' + paramIndex;
        // queryParams.push(status);
        // paramIndex++;
    }

    // Adicionar pesquisa por título ou descrição, se fornecido
    if (search) {
        // Dica: Adicione uma cláusula WHERE para title ou description usando LIKE e % (wildcard).
        // Use ILIKE para pesquisa case-insensitive no PostgreSQL.
        // Exemplo: query += ' AND (title ILIKE $' + paramIndex + ' OR description ILIKE $' + (paramIndex + 1) + ')';
        // queryParams.push(`%${search}%`);
        // queryParams.push(`%${search}%`);
        // paramIndex += 2; // Incrementa por 2 porque adicionamos 2 parâmetros
    }

    // Adicionar ordenação padrão
    query += ' ORDER BY created_at DESC';

    console.log('Query SQL para getTasks:', query);
    console.log('Parâmetros da query:', queryParams);

    try {
        // 1. Executar a query construída dinamicamente
        const result = await pool.query(query, queryParams);

        // 2. Retornar as tarefas (status 200)
        res.status(200).json({
            message: 'Tarefas obtidas com sucesso!',
            tasks: result.rows
        });

    } catch (error) {
        console.error('Erro ao obter tarefas com filtro/pesquisa:', error.message);
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
