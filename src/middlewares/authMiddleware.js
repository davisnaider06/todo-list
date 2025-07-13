const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'sua_chave_secreta_muito_forte';

exports.protect = (req, res, next) => {
    // Obter o token do cabeçalho da requisição
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Pega a segunda parte (o token em si)

    //Verificar se o token existe
    if (!token) {
        // Se não há token, o usuário não está autenticado
        return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }

    try {
        //Verificar e decodificar o token
        // jwt.verify(token, jwtSecret) vai lançar um erro se o token for inválido ou expirado
        const decoded = jwt.verify(token, jwtSecret);

        // Anexar o ID do usuário ao objeto req
        req.userId = decoded.id; 

        next();

    } catch (error) {
        console.error('Erro de autenticação do token:', error.message);
        return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
};