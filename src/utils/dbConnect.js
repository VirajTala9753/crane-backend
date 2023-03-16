const mongoose = require('mongoose')

const DBCluster = process.env.DATABASE
const DBLocal = process.env.DATABASE_LOCAL
console.log('🚀 ~ process.env.NODE_ENV', process.env.NODE_ENV)

let DB_URL = DBCluster

DB_URL = DB_URL.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

if (process.argv[2] && process.argv[2] === 'dblocal') DB_URL = DBLocal

console.log('🚀 ~ DB_URL', DB_URL)

module.exports = () => {
  console.log('connecting to DB...')
  return new Promise((resolve, reject) =>
    mongoose
      .connect(DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log(`DB connection successful!`.rainbow.bold)
        resolve()
      })
      .catch((err) => {
        console.log(' 🚀 ~ DB Connection Failed !'.red.bold)
        console.log(`err`, err)
        reject(err)
      })
  )
}
