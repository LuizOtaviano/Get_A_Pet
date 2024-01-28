const express = require('express')
const router = express.Router()
const PetController = require('../controllers/PetsControllers.js')

// middlewares
const verifyToken = require('../helpers/verify-token.js')
const { imageUpload } = require('../helpers/image-upload.js')

router.post('/create', verifyToken, imageUpload.array('images'), PetController.create)
router.get('/getall', PetController.getAll)
router.get('/mypets', verifyToken, PetController.getAllUserPets)


module.exports = router