const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    // 1. O cookie-parser pega no cookie que o Postman/navegador enviou
    const token = req.cookies.token;

    // 2. Se não houver token, o utilizador não fez login (ou já fez logout)
    if (!token) {
        return res.status(401).send({ "Error": "Acesso negado. Por favor, faça login." });
    }

    try {
        // 3. Verifica se o crachá é verdadeiro usando a mesma senha secreta do login
        const verified = jwt.verify(token, 'sla_pai');

        // 4. Guarda a informação decifrada do utilizador (o ID dele) no pedido
        req.user = verified;

        // 5. A porta abre-se! Manda seguir para o controlador da rota.
        next();
    } catch (error) {
        // Se o token foi manipulado por um hacker ou se expirou (passou 1 hora)
        res.status(401).send({ "Error": "Token inválido ou expirado." });
    }
}

module.exports = { verifyToken };