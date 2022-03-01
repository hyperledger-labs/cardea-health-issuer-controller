const Websockets = require('./websockets.js')

const express = require('express')
const router = express.Router()

const Contacts = require('./agentLogic/contacts.js')
const Credentials = require('./agentLogic/credentials.js')
const Demographics = require('./agentLogic/demographics.js')
var ExternalRecords = null
const BasicMessages = require('./agentLogic/basicMessages.js')
const Presentations = require('./agentLogic/presentations.js')
const QuestionAnswer = require('./agentLogic/questionAnswer')

router.post('/topic/connections', async (req, res, next) => {
  console.log('Aries Cloud Agent Webhook Message----Connection------')

  console.log('Connection Details:')
  const connectionMessage = req.body
  console.log(connectionMessage)

  res.status(200).send('Ok')

  await Contacts.adminMessage(connectionMessage)
})

router.post('/topic/issue_credential', async (req, res, next) => {
  console.log('Aries Cloud Agent Webhook Message----Credential Issuance------')

  console.log('Issuance Details:')
  const issuanceMessage = req.body
  console.log(issuanceMessage)

  res.status(200).send('Ok')

  await Credentials.adminMessage(issuanceMessage)
})

router.post('/topic/present_proof', async (req, res, next) => {
  console.log('Aries Cloud Agent Webhook Message----Presentations------')

  console.log('Presentation Details:')
  const presMessage = req.body
  console.log(presMessage)

  // (AmmonBurgi) Store the presentation on the opening state. Update the presentation on the other states.
  if (presMessage.state === 'request_sent') {
    await Presentations.createPresentationReports(presMessage)
  } else {
    await Presentations.updatePresentationReports(presMessage)
  }

  res.status(200).send('Ok')
  await Presentations.adminMessage(presMessage)
})

router.post('/topic/basicmessages', async (req, res, next) => {
  console.log('Aries Cloud Agent Webhook Message----Basic Message------')

  console.log('Message Details:')
  const basicMessage = req.body
  console.log(basicMessage)

  res.status(200).send('Ok')

  await BasicMessages.adminMessage(basicMessage)
})

router.post('/topic/data-transfer', async (req, res, next) => {
  console.log('Aries Cloud Agent Webhook Message----Data Transfer------')

  console.warn('No Goal Code Found')

  res.status(200).send('Ok')
})

// (mikekebert) Not used
// router.post('/topic/data-transfer/:goalCode', async (req, res, next) => {
//   console.log(
//     'Aries Cloud Agent Webhook Message----Data Transfer goalCode------',
//   )

//   console.log('Message Details:', req.params.goalCode)
//   if (req.params.goalCode === 'transfer.demographicdata') {
//     let connection_id = req.body.connection_id
//     let data = req.body.data[0].data.json

//     let contact = await Contacts.getContactByConnection(connection_id, [])

//     await Demographics.updateOrCreateDemographic(
//       contact.contact_id,
//       data.patient_surnames,
//       data.patient_given_names,
//       data.patient_date_of_birth,
//       data.patient_gender_legal,
//       data.patient_street_address,
//       data.patient_city,
//       data.patient_state_province_region,
//       data.patient_postalcode,
//       data.patient_country,
//       data.patient_phone,
//       data.patient_email,
//       data.medical_release_id,
//     )

//     // Issue External Records if needed
//     ExternalRecords.internalContactUpdate(contact.contact_id)
//   } else {
//   }

//   res.status(200).send('Ok')
// })

router.post('/topic/questionanswer', async (req, res, next) => {
  console.log('Aries Cloud Agent Webhook Message----Q&A Answer------')

  console.log('Message Details:')
  const answer = req.body
  console.log(answer)

  res.status(200).send('Ok')

  if (answer.state === 'answered') {
    await QuestionAnswer.adminMessage(answer)
  }
})

module.exports = router

ExternalRecords = require('./agentLogic/externalRecords.js')