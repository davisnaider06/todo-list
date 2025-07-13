const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const { check, param } = require('express-validator');


router.post(
    '/',
    authMiddleware.protect,
    [
        check('title', 'O título da tarefa é obrigatório e deve ter no mínimo 3 caracteres.').isLength({ min: 3 }),
        check('description', 'A descrição deve ter no máximo 500 caracteres.').optional().isLength({ max: 500 }),
        check('status', 'Status inválido. Use "pending" ou "completed".').optional().isIn(['pending', 'completed'])
    ],
    taskController.createTask
);


router.get('/', authMiddleware.protect, taskController.getTasks);


router.get(
    '/:id',
    authMiddleware.protect,
    [
        param('id', 'ID da tarefa inválido.').isInt()
    ],
    taskController.getTaskById
);


router.put(
    '/:id',
    authMiddleware.protect,
    [
        param('id', 'ID da tarefa inválido.').isInt(),
        check('title', 'O título da tarefa deve ter no mínimo 3 caracteres.').optional().isLength({ min: 3 }),
        check('description', 'A descrição deve ter no máximo 500 caracteres.').optional().isLength({ max: 500 }),
        check('status', 'Status inválido. Use "pending" ou "completed".').optional().isIn(['pending', 'completed'])
    ],
    taskController.updateTask
);


router.delete(
    '/:id',
    authMiddleware.protect,
    [
        param('id', 'ID da tarefa inválido.').isInt()
    ],
    taskController.deleteTask
);

module.exports = router;
