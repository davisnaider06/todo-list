
exports.errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Loga o stack traça do erro para depuração

    // Define o status do erro.
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    // Retorna uma resposta JSON com a mensagem de erro
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};
