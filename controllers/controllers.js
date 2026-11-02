const express = require('express')
const { Pool } = require('pg');

// Configuração da ligação à moda antiga
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'treino',
    password: '123456', // Numa instalação padrão do Ubuntu local, costuma vir sem senha
    port: 5432,
});

async function getAllClients(req, res) {
    try {
        const result = await pool.query(`SELECT * FROM clients`)
        res.send(result.rows)
    } catch (error) {
        res.status(500).send({"Error:" : "Database not connect"})
    }
}



async function getClient(req, res) {
    // É boa prática garantir que o ID é um número inteiro
    const id = +req.params.id

    try {

        const result = await pool.query(`SELECT * FROM clients WHERE id = $1`, [id])

        if(result.rows.length === 0){
            return res.status(404).send({"Error" : "Not Found"})
            
        }

        res.send(result.rows[0])
        
    } catch (error) {
        res.status(500).send({message: "DataBase not connected"})
    }
}


async function insertClient(req, res){

    const {name, email} = req.body
    
    try {
        const result = await pool.query(`INSERT INTO clients (name, email) VALUES ($1, $2) RETURNING *`, [name, email])

        res.send(result.rows[0])
    } catch (error) {
        res.status(500).send({message: "DataBase not connected"})

    }
}

async function updateClient(req, res){
    const id = +req.params.id
    const {name, email} = req.body

    try {
        const check = await pool.query(`SELECT * FROM clients WHERE id = $1`, [id])
        if(check.rows.length === 0){
            return res.send(404).status({"Error" : "Not found"})
        }
        const result = await pool.query(`UPDATE clients SET name = $1, email = $2 WHERE id = $3 RETURNING *`, [name, email, id])
        res.send(result.rows[0])
    } catch (error) {
        res.status(500).send({message: "DataBase not connected"})

    }
    
}

async function deleteClient(req, res) {
    const id = +req.params.id

    try {
        const result = await pool.query(`DELETE FROM clients WHERE id = $1`, [id])

        if(result.rowCount === 0){
            return res.status(404).send({"Error" : "Not found"})
        }

        res.send("Deleted with success")
    } catch (error) {
        res.status(500).send({message: "DataBase not connected"})

    }
}


module.exports = {getAllClients, getClient, insertClient, updateClient, deleteClient}