const ControllerError = require('../errors.js')

const AdminAPI = require('../adminAPI')
const Websockets = require('../websockets.js')

const requestPresentation = async (connectionID) => {
  console.log(`Requesting Presentation from Connection: ${connectionID}`)

  AdminAPI.Presentations.requestPresentation(
    connectionID,
    ['id', 'first_name', 'last_name'],
    'XDfTygX4ZrbdSr1H465123:2:Schema:1.0',
    'Requesting Presentation',
    false,
  )
}

const adminMessage = async (message) => {
  console.log('Received Presentations Message', message)

  if (message.state === 'verified') {
    Websockets.sendMessageToAll('PRESENTATIONS', 'VERIFIED', {
      connection_id: message.connection_id,
    })
  }
}

module.exports = {
  adminMessage,
  requestPresentation,
}
