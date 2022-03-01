const Websockets = require('../websockets.js')

let ContactsCompiled = require('../orm/contactsCompiled.js')
let Demographics = require('../orm/demographics.js')

const updateOrCreateDemographic = async function (
  contact_id,
  surnames,
  given_names,
  date_of_birth,
  gender_legal,
  street_address,
  city,
  state_province_region,
  postalcode,
  country,
  phone,
  email,
  medical_release_id,
) {
  try {
    await Demographics.createOrUpdateDemographic(
      contact_id,
      surnames,
      given_names,
      date_of_birth,
      gender_legal,
      street_address,
      city,
      state_province_region,
      postalcode,
      country,
      phone,
      email,
      medical_release_id,
    )

    const contact = await ContactsCompiled.readContact(contact_id, [
      'Demographic',
    ])

    Websockets.sendMessageToAll('CONTACTS', 'CONTACTS', {contacts: [contact]})
  } catch (error) {
    console.error('Error Fetching Contacts')
    throw error
  }
}

module.exports = {
  updateOrCreateDemographic,
}
