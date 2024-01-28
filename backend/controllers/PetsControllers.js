const Pet = require('../models/Pet.js')

// helpers
const getToken = require('../helpers/get-token.js')
const getUserByToken = require('../helpers/get-user-by-token.js')

module.exports = class PetsControllers {

  // Create a pet
  static async create(req, res) {
    
    const { name, age, weight, color } = req.body

    const images = req.files

    const avaliable = true

    // images upload

    // validations
    if(!name) {
      res.status(422).json({ message: "O campo nome não pode estar vazio!" })
      return
    }

    if(!age) {
      res.status(422).json({ message: "O campo idade não pode esetar vazio!" })
      return
    }

    if(!weight) {
      res.status(422).json({ message: "O campo peso não pode estar vazio!" })
      return
    }

    if(!color) {
      res.status(422).json({ message: "O campo cor não pode estar vazio!" })
      return
    }

    if(images.length === 0) {
      res.status(422).json({ message: "A imagem e obrigatoria!"})
      return
    }

    // get pet owner
    const token = getToken(req)
    const user = await getUserByToken(token)

    // create a pet
    const pet = new Pet({
      name,
      age,
      weight,
      color,
      avaliable,
      images: [],
      user: {
        _id: user._id,
        name: user.name,
        image: user.image,
        phone: user.phone
      }
    })

    images.map((image) => {
      pet.images.push(image.filename)
    })
    
    try {
      const newPet = await pet.save()
      res.status(201).json({
        message: "O pet foi criado",
        newPet
      })
    } catch(error) {
      res.status(500).json({ message: error })
    }
  }

  static async getAll(req, res) {
    try {
      const pets = await Pet.find().sort('-createdAt')
      res.status(200).json({ message: "Sucesso ao resgatar todos os pets", pets })
    } catch(error) {
      res.status(500).json({ message: error })
      return
    }
  }

  static async getAllUserPets(req, res) {

    // Get current user
    const token = getToken(req)
    const user = await getUserByToken(token)

    // Get user pets
    const pets = await Pet.find({ 'user._id': user._id }).sort('-createdAt')

    res.status(200).json({ user: user.name, pets })

  }

}