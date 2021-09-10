const Websockets = require('../websockets.js')

let ContactsCompiled = require('../orm/contactsCompiled.js')
let Passports = require('../orm/passports.js')

const updateOrCreatePassport = async function (
  contact_id,
  passport_number,
  surname,
  given_names,
  sex,
  date_of_birth,
  place_of_birth,
  nationality,
  date_of_issue,
  date_of_expiration,
  type,
  code,
  authority,
  photo,
) {
  try {
    await Passports.createOrUpdatePassport(
      contact_id,
      passport_number,
      surname,
      given_names,
      sex,
      date_of_birth,
      place_of_birth,
      nationality,
      date_of_issue,
      date_of_expiration,
      type,
      code,
      authority,
      photo,
    )

    const contact = await ContactsCompiled.readContact(contact_id, [
      'Demographic',
      'Passport',
    ])

    Websockets.sendMessageToAll('CONTACTS', 'CONTACT_CREATED_OR_UPDATED', {
      contacts: [contact],
    })
  } catch (error) {
    console.error('Error Fetching Contacts')
    throw error
  }
}

module.exports = {
  updateOrCreatePassport,
}
