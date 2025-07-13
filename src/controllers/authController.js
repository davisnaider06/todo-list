const bcrypt = require('bcryptjs'); // Para criptografar senhas
const jwt = require('jsonwebtoken'); // Para gerar tokens
const pool = require('../config/db');
const { validationResult } = require('express-validator');

//  chave secreta para JWT.
const jwtSecret = process.env.JWT_SECRET || 'sua_chave_secreta_muito_forte';

exports.register = async (req, res) => {

    const errors = validationResult(req);
    if  (!errors.isEmpty()){
        return res.status(400).json ({ errors: errors.array() })
    }

    const { username, email, password } = req.body;

    try {
        //verificação de existência
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (userExists.rows.length > 0){
            return res.status(400).json({message: "Usuário já existe"})
        };
    
        //criptografando a senha
        const senhaCriptografada = await bcrypt.hash(password, 10);
        
        
        //Inserir o novo usuário no banco de dados
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
            [username, email, senhaCriptografada]
        );

        //Retorn uma resposta de sucesso (status 201 Created)
        res.status(201).json({
            message: 'usuário criado com sucesso',
            user: newUser.rows[0].username
        });
        
        } catch (error) {
        console.error('Erro no registro:', error.message);
        res.status(500).json({message: 'erro no servidor', error: error.message});
    }
};

exports.login = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Validação básica de entrada
    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    try {
        //Encontrar o usuário pelo email no banco de dados
        const user =await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        const token = jwt.sign({ id: user.rows[0].id }, jwtSecret, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login bem-sucedido!', token });

    } catch (error) {
        console.error('Erro no login:', error.message);
        res.status(500).json({ message: 'Erro interno do servidor ao fazer login.', error: error.message });
    }
}
