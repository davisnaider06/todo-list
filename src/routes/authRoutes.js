const express = require('express');
const router = express.Router(); // O roteador do Express
const authController = require('../controllers/authController'); // Importa o controlador de autenticação
const { check } = require('express-validator');
// Rota para registro de usuário
router.post(
    '/register',
    [
        check('username', 'O nome de usuário é obrigatório e deve ter no mínimo 3 caracteres.').isLength({ min: 3 }),
        check('email', 'Por favor, inclua um email válido.').isEmail(),
        check('password', 'A senha é obrigatória e deve ter no mínimo 6 caracteres.').isLength({ min: 6 })
    ],
    authController.register
);


//Rota para login de usuário
router.post(
    '/login',
    [
        check('email', 'Por favor, inclua um email válido.').isEmail(),
        check('password', 'A senha é obrigatória.').exists()
    ],
    authController.login
);

// Exporta o roteador para ser usado no server.js
module.exports = router;
