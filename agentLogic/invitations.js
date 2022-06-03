const Util = require('../util')
const AdminAPI = require('../adminAPI')

let Connections = require('../orm/connections.js')

const base64url = require('base64url')

// Perform Agent Business Logic

// Create an invitation
const createSingleUseInvitation = async (
  alias = 'default',
  autoAccept = true,
  multiUse = false,
  public = false,
) => {
  try {
    const invitationMessage = await AdminAPI.Connections.createInvitation(
      alias,
      autoAccept,
      multiUse,
      public,
    )
    console.log(invitationMessage)

    await Connections.createOrUpdateConnection(
      invitationMessage.connection_id,
      'invitation',
      null,
      invitationMessage.alias,
      null,
      null,
      null,
      invitationMessage.invitation_url,
      invitationMessage.invitation,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    )

    // (JamesKEbert) TODO: Strategy of invitations, specifically broadcasting to users
    const invitation = await Connections.readConnection(
      invitationMessage.connection_id,
    )

    // Return to the user that triggered the generation of that invitation
    return invitation
  } catch (error) {
    console.error('Error Creating Invitation')
    throw error
  }
}

// Create Single Use Invitation that supports Connection reuse
// (JamesKEbert) TODO: We've created a function for connection reuse, some stop gaps specific to overall project. Should move to using Public DIDs for this purpose, or build the capability in ACA-Py to generate invitations from a specific local-DID to allow key recognition from a client for connection reuse
const createPersistentSingleUseInvitation = async (workflow = 'test_id') => {
  try {
    console.log(
      `Creating/fetching reusable invitation with workflow ${workflow}`,
    )

    let reuseInvite = await Connections.readInvitationByAlias(
      '_CONNECTION_REUSE_INVITATION',
    )

    console.log(reuseInvite)

    let alteredInvitationRecord = {
      ...reuseInvite.dataValues,
    }

    alteredInvitationRecord.invitation['workflow'] = workflow

    let invitationJSON = JSON.stringify(alteredInvitationRecord.invitation)
    const invitationString =
      alteredInvitationRecord.invitation.serviceEndpoint +
      '?c_i=' +
      Util.encodeBase64(invitationJSON)

    console.log(invitationString)
    alteredInvitationRecord.invitation_url = invitationString

    // Return to the user that triggered the generation of that invitation
    return alteredInvitationRecord
  } catch (error) {
    console.error('Error Creating Invitation')
    throw error
  }
}

const acceptInvitation = async (invitation_url) => {
  try {
    // Decoding the invitation url
    const url = new URL(invitation_url)
    const encodedParam = url.searchParams.get('c_i')
    const buff = Buffer.from(encodedParam, 'base64')
    const decodedInvitation = buff.toString('utf-8')

    const invitationMessage = await AdminAPI.Connections.acceptInvitation(
      decodedInvitation,
    )

    // Return some info about the new connection formed by accepting the invite so we can take further action
    return invitationMessage
  } catch (error) {
    console.error('Error Accepting Invitation')
    throw error
  }
}

const createOutOfBandInvitation = async () => {
  try {
    const OOBMessage = await AdminAPI.OOB.createOOBInvitation()

    //Retrieve service endpoint from invitation
    // const serviceEndpoint = OOBMessage.invitation.service[0].serviceEndpoint

    // const JSONInvitation = JSON.stringify(OOBMessage.invitation).trim()
    // const encodedInvitation = base64url(JSONInvitation)
    // const OOBInvitationURL = `${serviceEndpoint}?oob=${encodedInvitation}`

    // (eldersonar) This is original return
    // return OOBMessage.invitation_url
    return OOBMessage
  } catch (error) {
    console.error('Error sending out-of-band message!')
    throw error
  }
}

const acceptOutOfBandInvitation = async (invitation_url) => {
  try {
    // Decoding the invitation url
    const url = new URL(invitation_url)
    const encodedParam = url.searchParams.get('oob')
    const decodedOOBInvitation = base64url.decode(encodedParam)

    const invitationMessage = await AdminAPI.OOB.acceptOOBInvitation(
      decodedOOBInvitation,
    )

    return invitationMessage
  } catch (error) {
    console.error('Error accepting out-of-band invitation!')
    throw error
  }
}

module.exports = {
  createSingleUseInvitation,
  createPersistentSingleUseInvitation,
  acceptInvitation,
  acceptOutOfBandInvitation,
  createOutOfBandInvitation,
}
