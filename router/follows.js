const express = require('express');
const router = express.Router()
const verify = require('../middleware/authMiddleware')
const controller = require('../controllers/follow')

router.get('/following', verify.verifyToken, controller.getFollowing)
router.post('/:id', verify.verifyToken, controller.followIn)
//router.post('/delete', verify.verifyToken, controller.deleteAccount)


module.exports = router
