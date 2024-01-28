require("dotenv").config()
const mongoose = require('mongoose')

async function main() {
  await mongoose.connect(process.env.URI_MONGODB)
  console.log('Conectado ao mongoDB')
}

main().catch(err => {
  console.log(err)
})

module.exports = mongoose