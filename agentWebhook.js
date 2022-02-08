require('dotenv').config()

const Websockets = require('./websockets.js')

const base64url = require('base64url')
const express = require('express')
const router = express.Router()

const Contacts = require('./agentLogic/contacts.js')
const Credentials = require('./agentLogic/credentials.js')
const Demographics = require('./agentLogic/demographics.js')

var ExternalRecords = null
const Passports = require('./agentLogic/passports.js')
const BasicMessages = require('./agentLogic/basicMessages.js')
const Presentations = require('./agentLogic/presentations.js')

router.post('/topic/connections', async (req, res, next) => {
  console.log('Aries Cloud Agent Webhook Message----Connection------')

  console.log('Connection Details:')
  const connectionMessage = req.body
  console.log(connectionMessage)

  res.status(200).send('Ok')

  // (eldersonar) Send a proof request to the established connection
  if (connectionMessage.state === 'active')
    Presentations.requestIdentityPresentation(connectionMessage.connection_id)

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

router.post('/topic/data-transfer/:goalCode', async (req, res, next) => {
  console.log(
    'Aries Cloud Agent Webhook Message----Data Transfer goalCode------',
  )

  console.log('Message Details:', req.params.goalCode)
  if (req.params.goalCode === 'transfer.demographicdata') {
    let connection_id = req.body.connection_id
    let data = req.body.data[0].data.json

    let contact = await Contacts.getContactByConnection(connection_id, [])

    await Demographics.updateOrCreateDemographic(
      contact.contact_id,
      data.email,
      data.phone,
      data.address,
    )

    // Issue External Records if needed
    ExternalRecords.internalContactUpdate(contact.contact_id)
  } else if (req.params.goalCode === 'transfer.passportdata') {
    let connection_id = req.body.connection_id
    let data = req.body.data[0].data.json

    let contact = await Contacts.getContactByConnection(connection_id, [])

    await Passports.updateOrCreatePassport(
      contact.contact_id,
      data.passport_number,
      data.surname,
      data.given_names,
      data.sex,
      data.date_of_birth,
      data.place_of_birth,
      data.nationality,
      data.date_of_issue,
      data.date_of_expiration,
      data.type,
      data.code,
      data.authority,
      data.photo,
    )

    // Issue External Records if needed
    ExternalRecords.internalContactUpdate(contact.contact_id)
  } else {
  }

  res.status(200).send('Ok')
})

router.post('/topic/oob-invitation/', async (req, res, next) => {
  console.log(
    'Aries Cloud Agent Webhook Message----Create Out-Of-Band Message------',
  )

  console.log('OOB Details:')
  const OOBMessage = req.body
  console.log(OOBMessage)

  // const JSONInvitation = JSON.stringify(OOBMessage.invitation).trim()
  // const encodedInvitation = base64url(JSONInvitation)
  // const OOBInvitationURL = `${process.env.AGENT_TUNNEL_HOST}/ssi?oob=${encodedInvitation}`

  // Websockets.sendMessageToAll('INVITATIONS', 'INVITATION', {
  //   invitation_record: OOBInvitationURL,
  // })

  res.status(200).send('Ok')
})

module.exports = router

ExternalRecords = require('./agentLogic/externalRecords.js')
