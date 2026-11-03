const express = require('express')
const router = express.Router()
const controller = require('../controllers/authControllers')
const verify = require('../middleware/authMiddleware')

router.get('/', controller.getAllUsers)
router.get('/perfil', verify.verifyToken, controller.getPerfil)
router.get('/:id', controller.getAUser)
router.post('/register', controller.registerUser)
router.post('/login', controller.loginUser)
router.post('/logout', controller.logoutUser)
router.put('/update' , verify.verifyToken, controller.alterAccount)
router.delete('/delete', verify.verifyToken, controller.deleteAccount)


module.exports = router