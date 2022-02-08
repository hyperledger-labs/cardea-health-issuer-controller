const sendAdminMessage = require('./transport')

//Send an out-of-band message
const createOutOfBand = async () => {
  try {
    console.log('Generate OOB Message:')

    const response = await sendAdminMessage(
      'post',
      '/out-of-band/create-invitation',
      {},
      {
        use_public_did: false,
        include_handshake: true,
      },
    )

    return response
  } catch (error) {
    console.error('Error while sending out-of-band message!')
    throw error
  }
}

const acceptOutOfBandInvitation = async (invitation) => {
  try {
    console.log('Accepting out-of-band invitation.')
    let parsedInvitation = JSON.parse(invitation)

    const invitationMessage = await sendAdminMessage(
      'post',
      `/out-of-band/receive-invitation`,
      {},
      parsedInvitation,
    )

    return invitationMessage
  } catch (error) {
    console.error('Error accepting OOB invitation!')
    throw error
  }
}

module.exports = {
  createOutOfBand,
  acceptOutOfBandInvitation,
}
