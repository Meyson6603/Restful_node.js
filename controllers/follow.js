const { Pool } = require('pg')
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'treino',
    password: '123456', 
    port: 5432,
})

async function followIn(req,res) {
    const id_user = +req.user.id
    const id_follow = +req.params.id

    if(!id_follow){
        res.status(404).send({"Error:": "esse usuario existe nao pai"})
    }

    if(id_user === id_follow){
        return res.status(404).send({"Error:": "Tu ta tentando se seguir malandro ?"})
    }

    const result = await pool.query(`INSERT INTO follows (follower_id, following_id) VALUES ($1,$2)`, [id_user, id_follow])
    res.send(result)
}

// Lista as pessoas que o usuário informado na URL segue.
async function getFollowing(req, res) {

    const userId = +req.user.id
    
    if(!userId){
        return res.status(404).send({message: "tu nem ta logado pai, vai logar"})
    }

    try {
        const result = await pool.query(
            `SELECT u.id, u.name
             FROM follows AS f
             JOIN users AS u ON u.id = f.following_id
             WHERE f.follower_id = $1
             ORDER BY u.id`,
            [userId]
        );
        return res.send(result.rows)
    } catch (error) {
        console.error('Erro ao consultar pessoas seguidas:', error);
        return res.status(500).json({ error: 'Não foi possível consultar as pessoas seguidas.' });
    }
}
async function deleteAccount(req, res) {
    // Pega o ID direto do token (mais seguro, sem precisar passar na URL)
    const userId = +req.user.id;

    try {
        // 1. O jeito fácil: limpa os rastros primeiro! 
        // Apaga tudo onde ele segue alguém ou é seguido por alguém
        await pool.query(
            `DELETE FROM follows WHERE follower_id = $1 OR following_id = $1`, 
            [userId]
        );

        // 2. Agora o banco de dados está livre e deixa apagar o usuário tranquilamente
        const result = await pool.query(
            `DELETE FROM users WHERE id=$1`, 
            [userId]
        );

        if(result.rowCount === 0){
            return res.status(404).send({"Error": "Conta não encontrada"});
        }

        // 3. Apaga o cookie (crachá) para o utilizador ser deslogado na hora
        res.clearCookie('token');
        
        res.send({ message: "Conta e seguidores deletados com sucesso!" });

    } catch (error) {
        console.error(error);
        res.status(500).send({ "Error": "Erro interno do servidor" });
    }
}

module.exports = {followIn, getFollowing, deleteAccount}
