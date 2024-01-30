const Pet = require('../models/Pet.js')

// helpers
const getToken = require('../helpers/get-token.js')
const getUserByToken = require('../helpers/get-user-by-token.js')
const ObjectId = require('mongoose').Types.ObjectId

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

  static async getAllUserAdoptions(req, res) {

    // Get currente user
    const token = getToken(req)
    const user = getUserByToken(token)

    const pets = await Pet.find({ 'adopeter._id': user._id }).sort('-createAt')

    res.status(200).json({ user: user.name, pets })

  }

  static async getPetById(req, res) {
    const id = req.params.id

    if(!ObjectId.isValid(id)) {
      res.status(422).json({ message: 'O id do pet não e valido' })
      return
    }

    const pet = await Pet.find({_id: id}).sort("-createAt")

    if(!pet) {
      res.status(404).json({ message: 'Pet não encontrado' })
      return
    }

    res.status(200).json({ pet })
  }

  static async removePetById(req, res) {

    const id = req.params.id

    if(!ObjectId.isValid(id)) {
      res.status(422).json({ message: 'O id do pet não valido' })
      return
    }

    // check if pet exists
    const pet = await Pet.findOne({ _id: id })

    if(!pet) {
      res.status(404).json({ message: 'O pet não existe!' })
      return
    }

    // check if logged in user registered the pet
    const token = getToken(req)
    const user = await getUserByToken(token)

    if(pet.user._id.toString() !== user._id.toString()) {
      res.status(422).json({ message: "Houve um problema em processar sua solicitação tente novamente" })
      return
    }

    // reomove pet
    try {
      await Pet.findByIdAndDelete(id)
      res.status(200).json({ message: "Pet removido com sucesso" })
    } catch(error) {
      res.status(500).json({ message: error })
    }
  }

  static async updatePet(req, res) {
    const id = req.params.id
    const { name, age, weight, color, avaliable } = req.body
    const images = req.files

    const updateData = {}

    // validations
    if (!ObjectId.isValid(id)) {
      res.status(404).json({ message: "O id do pet não e encontrado!" })
    }

    // check if pet exits
    const pet = await Pet.findOne({ _id: id })

    if (!pet) {
      res.status(404).json({ message: "Pet não encontrado!" })
    }

    // check if logged in user registered the pet
    const token = getToken(req)
    const user = await getUserByToken(token)

    if (pet.user._id.toString() !== user._id.toString()) {
      res
        .status(422)
        .json({
          message:
            "Houve um problema em processar sua solicitação tente novamente",
        })
      return
    }

    if (!name) {
      res.status(422).json({ message: "O campo nome não pode estar vazio!" })
      return
    }

    updateData.name = name

    if (!age) {
      res.status(422).json({ message: "O campo idade não pode esetar vazio!" })
      return
    }

    updateData.age = age

    if (!weight) {
      res.status(422).json({ message: "O campo peso não pode estar vazio!" })
      return
    }

    updateData.age = weight

    if (!color) {
      res.status(422).json({ message: "O campo cor não pode estar vazio!" })
      return
    }

    updateData.color = color

    if (images.length === 0) {
      res.status(422).json({ message: "A imagem e obrigatoria!" })
      return
    } else {
      updateData.images = []
      images.map(image => {
        updateData.images.push(image.filename)
      })
    }

    await Pet.findByIdAndUpdate(id, updateData)

    res.status(200).json({ message: 'Pet atualizado com sucesso' })

  }

  static async schedule(req, res) {

    const id = req.params.id

    // check if pets exits
    const pet = await Pet.findOne({ _id: id })

    if(!pet) {
      res.status(404).json({ message: "Pet não encontrado" })
      return
    }

    // check if user regisered the pet
    const token = getToken(req)
    const user = await getUserByToken(token)

    if(pet.user._id.equals(user._id)) {
      res.status(422).json({ message: "Você não pode agendar uma visita com o seu próprio pet" })
      return
    }

    // check if user has already scheduled a visit
    if(pet.adopeter) {
      if(pet.adopeter._id.equals(user._id)) {
        res.status(422).json({ message: "Você já agendou uma visita para esse pet" })
        return
      }
    }

    // add user to pet
    pet.adopeter = {
      _id: user._id,
      name: user.name,
      image: user.image
    }

    await Pet.findByIdAndUpdate(id, pet)

    res.status(200).json({ message: `A visita foi agendada com sucesso, entre em contato com ${pet.user.name} pelo telefone ${pet.user.phone}`, pet })

  }

  static async concludeAdoption(req, res) {

    const id = req.params.id

    // check if pet exists
    const pet = await Pet.findOne({ _id: id })

    if(!pet) {
      res.status(404).json({ message: "O pet não foi encontrado" })
    }

    // check if user regisered the pet
    const token = getToken(req)
    const user = await getUserByToken(token)

    if(pet.user._id.toString() !== user._id.toString()) {
      res.status(422).json({ message: "Você não pode agendar uma visita com o seu próprio pet" })
      return
    }

    pet.avaliable = false

    await Pet.findByIdAndUpdate(id, pet)

    res.status(200).json({ message: 'Parabéns! O ciclo de adoção foi concluido!' })
  }

}