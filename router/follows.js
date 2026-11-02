const express = require('express');
const router = express.Router()
const verify = require('../middleware/authMiddleware')
const controller = require('../controllers/follow')

router.get('/:id', verify.verifyToken, controller.followIn)
router.get('/:id/following', verify.verifyToken, controller.getFollowing)

module.exports = router
