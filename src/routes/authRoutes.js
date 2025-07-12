const express = require('express');
const router = express.Router(); // O roteador do Express
const authController = require('../controllers/authController'); // Importa o controlador de autenticação

// Rota para registro de usuário
router.post('/register', authController.register);


//Rota para login de usuário
router.post('/login', authController.login);

// Exporta o roteador para ser usado no server.js
module.exports = router;
