const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas abaixo usarão o middleware authMiddleware.protect
// Isso significa que o usuário precisa estar autenticado para acessá-las.

// Criar uma nova tarefa (POST /api/tasks)
router.post('/', authMiddleware.protect, taskController.createTask);

// Obter todas as tarefas do usuário (GET /api/tasks)
router.get('/', authMiddleware.protect, taskController.getTasks);

// Obter uma única tarefa por ID (GET /api/tasks/:id)
router.get('/:id', authMiddleware.protect, taskController.getTaskById);

// Atualizar uma tarefa (PUT /api/tasks/:id)
router.put('/:id', authMiddleware.protect, taskController.updateTask);

// Deletar uma tarefa (DELETE /api/tasks/:id)
router.delete('/:id', authMiddleware.protect, taskController.deleteTask);

module.exports = router;
