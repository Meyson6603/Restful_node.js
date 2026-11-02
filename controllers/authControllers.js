const { Pool } = require('pg')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'treino',
    password: '123456', 
    port: 5432,
})

async function getAllUsers(req, res) {
    try {
        const result = await pool.query(`SELECT id, name, email FROM users`)
        res.send(result.rows)
    } catch (error) {
        console.log(error)
        res.status(500).send({"Error:" : "Database not connect"})
    }
}

async function getAUser(req, res) {
    const id = +req.params.id

    try {
        const result = await pool.query(`SELECT id, name, email FROM users WHERE id = $1`, [id])
        if(result.rows.length === 0){
            return res.status(404).send({"Error:" : "Not found"})
        }
        res.send(result.rows[0].name)
    } catch (error) {
        res.status(500).send({"Error:" : "Database not connect"})
    }

}

async function getPerfil(req, res) {
    // Graças ao middleware, agora sabemos exatamente qual é o ID do utilizador logado!
    const userId = req.user.id;

    try {
        const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [userId]);
        res.send({ 
            message: "Estás logado com sucesso!", 
            perfil: result.rows[0] 
        });
    } catch (error) {
        res.status(500).send({ "Error": "Database not connect" });
    }
}

async function registerUser(req,res) {
    const {name, email, password} = req.body;

    try {
        // 1. Encripta a palavra-passe (o '10' é o nível de complexidade da encriptação)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Insere na base de dados (enviando a hashedPassword em vez da password original)
        // O RETURNING devolve apenas o id, name e email (escondendo a palavra-passe da resposta)
        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );

        // 3. Devolve o utilizador criado com o status 201 (Created)
        res.status(201).send(result.rows[0]);
    } catch (error) {
        res.status(500).send({"Error:" : "Database not connect"})
    }

}

async function loginUser(req, res) {
    if(!req.body){
        return res.status(404).send("Dados Vazios, favor preencher")
    }
    const { email, password } = req.body;

    if((email == undefined)){
        return res.status(404).send("Preenche o email desgraça")
    }
    if((password == undefined)){
        return res.status(404).send("Preenche a senha desgraça")
    }

    try{

        const user = await pool.query(`SELECT * FROM users WHERE email = $1`, [email])

        if(user.rows[0].length === 0){
            return res.status(404).send({"Error:" : "E-mail ou senha inválidos"})
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password)

        if(!validPassword){
            return res.status(404).send({"Error:" : "E-mail ou senha inválidos"})
        }

        const token = jwt.sign({id: user.rows[0].id}, 'sla_pai', {expiresIn: '1h'})

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 3600000
        })

        res.send(user.rows[0].name)


    } catch (error) {
        console.log(error); // Ajuda a debugar se algo falhar
        res.status(500).send({ "Error": "Database not connect" });
    }
}

async function logoutUser(req, res) {
    try {
        res.clearCookie('token');
        res.send("vai embora pai")
    } catch (error) {
        res.status(500).send({ "Error": "Database not connect" });
    }
}

async function deleteAccount(req, res) {

    const id = +req.user.id
    
    try {
        const result = await pool.query(`DELETE FROM users WHERE id=$1`, [id])
        if(result.rowCount === 0){
            return res.status(404).send({"Error:" : "Account not found"})
        }

        res.send("Conta deletada com sucesso")

    } catch (error) {
        res.status(500).send({ "Error": "Database not connect" });
    }
}
module.exports = {getAllUsers, getAUser, getPerfil, registerUser, loginUser, logoutUser, deleteAccount}