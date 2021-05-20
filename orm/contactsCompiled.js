const {Contact} = require('./contacts.js')
const {Connection} = require('./connections.js')
const {Demographic} = require('./demographics.js')
const {Passport} = require('./passports.js')

const readContacts = async function (additionalTables = []) {
  try {
    let models = []

    if (additionalTables.includes('Demographic')) {
      models.push({
        model: Demographic,
        required: false,
      })
    }
    if (additionalTables.includes('Passport')) {
      models.push({
        model: Passport,
        required: false,
      })
    }

    const contacts = await Contact.findAll({
      include: [
        {
          model: Connection,
          required: true,
        },
        ...models,
      ],
    })
    return contacts
  } catch (error) {
    console.error('Could not find contacts in the database: ', error)
  }
}

const readContact = async function (contact_id, additionalTables = []) {
  try {
    let models = []

    if (additionalTables.includes('Demographic')) {
      models.push({
        model: Demographic,
        required: false,
      })
    }
    if (additionalTables.includes('Passport')) {
      models.push({
        model: Passport,
        required: false,
      })
    }

    const contact = await Contact.findAll({
      where: {
        contact_id,
      },
      include: [
        {
          model: Connection,
          required: true,
        },
        ...models,
      ],
    })

    return contact[0]
  } catch (error) {
    console.error('Could not find contact in the database: ', error)
  }
}

const readContactByConnection = async function (
  connection_id,
  additionalTables = [],
) {
  try {
    let models = []

    if (additionalTables.includes('Demographic')) {
      models.push({
        model: Demographic,
        required: false,
      })
    }
    if (additionalTables.includes('Passport')) {
      models.push({
        model: Passport,
        required: false,
      })
    }

    const contact = await Contact.findAll({
      include: [
        {
          model: Connection,
          required: true,
          where: {
            connection_id: connection_id,
          },
        },
        ...models,
      ],
    })

    return contact[0]
  } catch (error) {
    console.error('Could not find contact in the database: ', error)
  }
}

module.exports = {
  readContact,
  readContacts,
  readContactByConnection,
}
