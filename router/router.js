const express = require('express')
const router = express.Router()
const controller = require('../controllers/controllers')
const controllerUsers = require('../controllers/authControllers')


//teste de aplicação
router.get('/', controller.getAllClients)
router.get('/:id', controller.getClient)
router.post('/', controller.insertClient)
router.put('/:id', controller.updateClient)
router.delete('/:id', controller.deleteClient)

//authClient




module.exports = router;