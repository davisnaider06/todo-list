const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { check } = require('express-validator');


router.post(
    '/register',
    [
        check('username', 'O nome de usuário é obrigatório e deve ter no mínimo 3 caracteres.').isLength({ min: 3 }),
        check('email', 'Por favor, inclua um email válido.').isEmail(),
        check('password', 'A senha é obrigatória e deve ter no mínimo 6 caracteres.').isLength({ min: 6 })
    ],
    authController.register
);

router.post(
    '/login',
    [
        check('email', 'Por favor, inclua um email válido.').isEmail(),
        check('password', 'A senha é obrigatória.').exists()
    ],
    authController.login
);

module.exports = router;
