const Bank = require('./models/Bank')
const db = require('./db')

const banksData = [
  {
    name: 'State Banks of India',
    logo_url: 'http://google.com/xyz',
  },
  {
    name: 'Bank of Baroda',
    logo_url: 'http://google.com/xyz',
  },
]

const main = async () => {
  await db.connect() // Mongoose.connect or some other method which connects to MongoDB

  const bulkOperations = []
  for (const bank of banksData) {
    bulkOperations.push({
      filter: {
        name: bank.name,
      },
      update: {
        $set: bank,
      },
      upsert: true,
    })
  }

  console.log(`${bulkOperations.length} banks will be updated`)

  await Bank.bulkWrite(bulkOperations, { ordered: false })
}

main()
  .then((data) => console.log('Script ran successfully!'))
  .catch((e) => console.log('Script failed with an error', e))
