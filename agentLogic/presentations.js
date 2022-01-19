const ControllerError = require('../errors.js')

const AdminAPI = require('../adminAPI')
const Websockets = require('../websockets.js')
const Contacts = require('./contacts.js')
const Passports = require('./passports.js')
const Demographics = require('./demographics.js')

// (eldersonar) Request identity proof
const requestIdentityPresentation = async (connectionID) => {
  console.log(`Requesting Presentation from Connection: ${connectionID}`)

  const result = AdminAPI.Presentations.requestProof(
    connectionID,
    // (eldersonar) Add remaining fields when the holder is fixed.
    [
      'email',
      'phone',
      'address',
      'surname',
      'given_names',
      'sex',
      'date_of_birth',
    ],
  )

  return result
}

const requestPresentation = async (connectionID) => {
  console.log(`Requesting Presentation from Connection: ${connectionID}`)

  AdminAPI.Presentations.requestPresentation(
    connectionID,
    ['mud_id', 'employee_first_name', 'employee_last_name'],
    'XDfTygX4ZrbdSr1HiBqef1:2:Schema:1.0',
    'Requesting Presentation',
    false,
  )
}

const adminMessage = async (message) => {
  console.log('Received Presentations Message', message)

  if (message.state === 'verified') {
    if (message.verified === 'true') {
      console.log('Employee has been verified')
      Websockets.sendMessageToAll('PRESENTATIONS', 'EMPLOYEE_VERIFIED', {
        connection_id: message.connection_id,
      })
    } else {
      // (eldersonar) Get contact id
      let contact = await Contacts.getContactByConnection(
        message.connection_id,
        [],
      )

      // (edersonar) Create demographics
      await Demographics.updateOrCreateDemographic(
        contact.contact_id,
        message.presentation.requested_proof.self_attested_attrs.email,
        message.presentation.requested_proof.self_attested_attrs.phone,
        JSON.parse(
          message.presentation.requested_proof.self_attested_attrs.address,
        ),
      )

      // (eldersonar) Create passport
      await Passports.updateOrCreatePassport(
        contact.contact_id,
        message.presentation.requested_proof.self_attested_attrs
          .passport_number,
        message.presentation.requested_proof.self_attested_attrs.surname,
        message.presentation.requested_proof.self_attested_attrs.given_names,
        message.presentation.requested_proof.self_attested_attrs.sex,
        message.presentation.requested_proof.self_attested_attrs.date_of_birth,
        message.presentation.requested_proof.self_attested_attrs.place_of_birth,
        message.presentation.requested_proof.self_attested_attrs.nationality,
        message.presentation.requested_proof.self_attested_attrs.date_of_issue,
        message.presentation.requested_proof.self_attested_attrs
          .date_of_expiration,
        message.presentation.requested_proof.self_attested_attrs.type,
        message.presentation.requested_proof.self_attested_attrs.code,
        message.presentation.requested_proof.self_attested_attrs.authority,
        message.presentation.requested_proof.self_attested_attrs.photo,
      )
    }
  }
}

module.exports = {
  adminMessage,
  requestPresentation,
  requestIdentityPresentation,
}
