const User = require('../models/User.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// Helpers
const createUserToken = require('../helpers/create-user-token.js')
const getToken = require('../helpers/get-token.js')
const getUserByToken = require('../helpers/get-user-by-token.js')

module.exports = class UserController {
  static async register(req, res) {
    const { name, email, phone, password, confirmpassword } = req.body

    // validations
    if(!name){
      res.status(422).json({ message: 'O campo nome e obrigatorio!' })
      return
    }

    if (!email) {
      res.status(422).json({ message: "O campo email e obrigatorio!" })
      return
    }

    if (!phone) {
      res.status(422).json({ message: "O campo telefone e obrigatorio!" })
      return
    }

    if (!password) {
      res.status(422).json({ message: "O campo senha e obrigatorio!" })
      return
    }

    if (!confirmpassword) {
      res.status(422).json({ message: "O confirmação de senha e obrigatorio!" })
      return
    }

    if(password !== confirmpassword) {
      res.status(400).json({ message: "As senha não são iguais!" })
    }

    // check if user exists
    const userExists = await User.findOne({email})

    if(userExists) {
      res.status(409).json({ message: "Por favor, ultilize outro e-mail" })
      return
    }

    // create password
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    // create user
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword
    })

    try {
      const newUser = await user.save()
      await createUserToken(newUser, req, res)
    } catch (err) {
      res.status(500).json({ message: err })
    }
  }

  static async login(req, res) {
    
    const {email, password} = req.body

    // validations
    if(!email) {
      res.status(422).json({ message: 'O campo email não pode estar vazio!' })
      return
    }

    const user = await User.findOne({email})

    if(!user) {
      res.status(400).json({ message: 'Não há usuário cadastrado com esse email!' })
      return
    }

    if(!password) {
      res.status(422).json({ message: 'Senha O campo senha não pode estar vazio' })
      return
    }

    // check if password match with db password
    const checkPassword = await bcrypt.compare(password, user.password)

    if(checkPassword) {
      await createUserToken(user, req, res)
    } else {
      res.status(400).json({ message: "Senha incorreta. Tente novamente!" })
      return
    }

  }

  static async checkUser(req, res) {
    let currentUser

    if(req.headers.authorization) {
      
      const token = getToken(req)

      const decoded = jwt.verify(token, process.env.SECRET)

      currentUser = await User.findById(decoded.id)

      currentUser.password = undefined

    }else {
      currentUser = null
    }
    res.status(200).send(currentUser)
  }

  static async getUserById(req, res) {

    const id = req.params.id
    const user = await User.findById(id).select("-password")
    
    if(!user) {
      res.status(400).json({ message: "Usuário não encontrado!" })
      return
    }

    res.status(200).json({ user })
  }

  static async editUser(req, res) {
    const id = req.params.id

    // check if user exists
    const token = getToken(req)
    const user = await getUserByToken(token)

    const { name, email, phone, password, confirmpassword } = req.body

    if(req.file) {
      user.image = req.file.filename
    }

    // validations
    if (!name) {
      res.status(422).json({ message: "O campo nome e obrigatorio!" })
      return
    }

    user.name = name

    if (!email) {
      res.status(422).json({ message: "O campo email e obrigatorio!" })
      return
    }

    const userExists = await User.findOne({ email })

    // check if email has already taken
    if (user.email !== email && userExists) {
      res.status(422).json({
        message: "Por favor, utilize outro e-mail",
      })
    }

    user.email = email

    if (!phone) {
      res.status(422).json({ message: "O campo telefone e obrigatorio!" })
      return
    }

    user.phone = phone

    if (!password) {
      res.status(422).json({ message: "O campo senha e obrigatorio!" })
      return
    }

    if(password !== confirmpassword) {
      res.status(422).json({ message: 'As senhas não conferem!' })
      return
    } else if(password === confirmpassword && password != null) {

      // create a new password
      const salt = await bcrypt.genSalt(12)
      const passwordHash = await bcrypt.hash(password, salt)

      user.password = passwordHash
    }

    try {

      // return user updated data
      await User.findOneAndUpdate(
        { _id: id },
        { $set: user },
        { new: true }
      )

      res.status(200).json({ message: "Usuário atualizado com sucesso!" })

    } catch(err) {
      res.status(500).json({ message: err })
      return
    }
  }
}