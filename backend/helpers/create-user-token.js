const jwt = require('jsonwebtoken')
require('dotenv').config()

const createUserToken = async(user, req, res) => {

  const token = jwt.sign({
    name: user.name,
    id: user._id
  }, process.env.SECRET)

  // return token
  res.status(200).json({
    message: 'Você está autenticado',
    token: token,
    userId: user._id
  })

}

module.exports = createUserToken