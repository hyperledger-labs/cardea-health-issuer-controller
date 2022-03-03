const sendAdminMessage = require('./transport')

//Send an out-of-band message
const createOOBInvitation = async () => {
  try {
    console.log('Generate OOB Message:')

    const response = await sendAdminMessage(
      'post',
      '/out-of-band/create-invitation',
      {},
      {
        //(AmmonBurgi) The Connections protocol and/or the DIDExchange protocol can be listed below. If both protocols are listed the order does matter.
        handshake_protocols: [
          'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0',
        ],
        use_public_did: false,
      },
    )

    return response
  } catch (error) {
    console.error('Error while sending out-of-band message!')
    throw error
  }
}

const acceptOOBInvitation = async (invitation) => {
  try {
    console.log('Accepting out-of-band invitation.')
    let parsedInvitation = JSON.parse(invitation)

    const invitationMessage = await sendAdminMessage(
      'post',
      `/out-of-band/receive-invitation`,
      {
        auto_accept: true,
      },
      parsedInvitation,
    )

    return invitationMessage
  } catch (error) {
    console.error('Error accepting OOB invitation!')
    throw error
  }
}

module.exports = {
  createOOBInvitation,
  acceptOOBInvitation,
}